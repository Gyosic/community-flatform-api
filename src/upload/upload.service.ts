import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class UploadService {
  private readonly storageRoot: string;

  constructor(private readonly configService: ConfigService) {
    this.storageRoot = configService.get<string>(
      'FILE_STORAGE_ROOT',
      '/tmp/community',
    );
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

  async deleteFile(filename: string) {
    const filePath = join(this.storageRoot, filename);
    try {
      await unlink(filePath);
    } catch {
      throw new NotFoundException(`File '${filename}' not found`);
    }
    return { message: `File '${filename}' deleted` };
  }
}
