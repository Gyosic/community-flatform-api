import {
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.formatFileResponse(file);
  }

  @UseGuards(JwtAuthGuard)
  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files'))
  uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    return this.uploadService.formatFilesResponse(files);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':filename')
  deleteFile(@Param('filename') filename: string) {
    return this.uploadService.deleteFile(filename);
  }
}
