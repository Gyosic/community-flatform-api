import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { PassportModule } from '@nestjs/passport';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { createMulterConfigFactory } from '../common/multer/multer.config';

@Module({
  imports: [
    PassportModule,
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: createMulterConfigFactory('profile'),
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
