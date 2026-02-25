import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';

export function multerConfigFactory(
  configService: ConfigService,
): MulterOptions {
  const storageRoot = configService.get<string>(
    'FILE_STORAGE_ROOT',
    '/tmp/community',
  );
  const maxFileSize = configService.get<number>('MAX_FILE_SIZE', 10485760);
  const allowedTypes = configService
    .get<string>('ALLOWED_FILE_TYPES', 'image/*,application/pdf')
    .split(',')
    .map((t) => t.trim());

  return {
    storage: diskStorage({
      destination: storageRoot,
      filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      },
    }),
    limits: { fileSize: maxFileSize },
    fileFilter: (_req, file, cb) => {
      const isAllowed = allowedTypes.some((type) => {
        if (type.endsWith('/*')) {
          const prefix = type.split('/')[0];
          return file.mimetype.startsWith(`${prefix}/`);
        }
        return file.mimetype === type;
      });

      if (!isAllowed) {
        return cb(
          new BadRequestException(
            `File type '${file.mimetype}' is not allowed. Allowed: ${allowedTypes.join(', ')}`,
          ),
          false,
        );
      }
      cb(null, true);
    },
  };
}
