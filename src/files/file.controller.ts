import {
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { FileService } from './file.service';

@ApiTags('Files')
@Controller('api/files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @ApiOperation({ summary: '파일 조회 (Range 지원)' })
  @Get('*filepath')
  async getFile(
    @Param('filepath') _filepath: string,
    @Headers('range') range: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const filepath = _filepath.split(',').join('/');
    const { size, fullPath } = await this.fileService.getFileStat(filepath);

    const contentType = this.fileService.getContentType(filepath);

    if (range) {
      const { start, end, chunkSize } = this.fileService.parseRange(
        range,
        size,
      );
      const stream = this.fileService.createStream(fullPath, { start, end });

      res.status(206);
      res.set({
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Content-Length': chunkSize.toString(),
        'Accept-Ranges': 'bytes',
        'Content-Type': contentType,
      });

      return new StreamableFile(stream);
    }

    const stream = this.fileService.createStream(fullPath);

    res.set({
      'Content-Length': size.toString(),
      'Content-Type': contentType,
    });

    return new StreamableFile(stream);
  }

  @ApiOperation({ summary: '파일 삭제' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('*filepath')
  deleteFile(@Param('filepath') filepath: string) {
    return this.fileService.deleteFile(filepath);
  }
}
