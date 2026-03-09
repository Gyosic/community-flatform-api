import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { stat, unlink } from 'fs/promises';
import { createReadStream, type ReadStream } from 'fs';
import { join, extname } from 'path';

const MIME_MAP: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

@Injectable()
export class FileService {
  private readonly storageRoot: string;

  constructor(private readonly configService: ConfigService) {
    this.storageRoot = configService.get<string>(
      'FILE_STORAGE_ROOT',
      '/tmp/community',
    );
  }

  private resolvePath(filepath: string): string {
    const resolved = join(this.storageRoot, filepath);
    if (!resolved.startsWith(this.storageRoot)) {
      throw new NotFoundException('File not found');
    }
    return resolved;
  }

  async getFileStat(
    filepath: string,
  ): Promise<{ size: number; fullPath: string }> {
    const fullPath = this.resolvePath(filepath);
    try {
      const fileStat = await stat(fullPath);
      return { size: fileStat.size, fullPath };
    } catch {
      throw new NotFoundException('File not found');
    }
  }

  getContentType(filepath: string): string {
    const ext = extname(filepath).toLowerCase();
    return MIME_MAP[ext] || 'application/octet-stream';
  }

  createStream(
    fullPath: string,
    options?: { start: number; end: number },
  ): ReadStream {
    return createReadStream(fullPath, options);
  }

  parseRange(range: string, size: number) {
    const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : size - 1;
    const chunkSize = end - start + 1;
    return { start, end, chunkSize };
  }

  formatFileResponse(file: Express.Multer.File) {
    return {
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  formatFilesResponse(files: Express.Multer.File[]) {
    return files.map((file) => this.formatFileResponse(file));
  }

  async deleteFile(filepath: string) {
    const fullPath = this.resolvePath(filepath);
    try {
      await unlink(fullPath);
    } catch {
      throw new NotFoundException('File not found');
    }
    return { message: 'File deleted' };
  }
}
