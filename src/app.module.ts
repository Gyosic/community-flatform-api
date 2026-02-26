import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { validate } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { MailModule } from './mail/mail.module';
import { RedisModule } from './redis/redis.module';
import { MenuModule } from './menu/menu.module';
import { PagesModule } from './pages/pages.module';
import { PostsModule } from './posts/posts.module';
import { SystemModule } from './system/system.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate,
    }),
    DatabaseModule,
    RedisModule,
    AuthModule,
    PostsModule,
    PagesModule,
    MenuModule,
    SystemModule,
    UploadModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
