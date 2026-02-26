import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS = Symbol('REDIS');

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new Redis(configService.get<string>('REDIS_URL')!);
      },
    },
  ],
  exports: [REDIS],
})
export class RedisModule {}
