import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import Redis from 'ioredis';
import { DRIZZLE } from '../database/database.module';
import { REDIS } from '../redis/redis.module';
import * as schema from '../database/schema';

@Injectable()
export class UsersService {
  private readonly storageRoot: string;

  constructor(
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
    @Inject(REDIS) private redis: Redis,
    private readonly configService: ConfigService,
  ) {
    this.storageRoot = this.configService.get<string>(
      'FILE_STORAGE_ROOT',
      '/tmp/community',
    );
  }

  async updateProfile(
    userId: string,
    name: string,
    files?: Express.Multer.File[],
  ) {
    const updateData: { name: string; image?: string } = { name };

    if (files && files.length > 0) {
      const file = files[0];
      updateData.image =
        file.destination.replace(this.storageRoot, '') + '/' + file.filename;
    }

    const [updated] = await this.db
      .update(schema.users)
      .set(updateData)
      .where(eq(schema.users.id, userId))
      .returning();

    return updated;
  }
}
