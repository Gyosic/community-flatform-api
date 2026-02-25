import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import * as schema from '../database/schema';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';

@Injectable()
export class MenuService {
  constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

  async findOne() {
    const [row] = await this.db.select().from(schema.menu).limit(1);
    return row || null;
  }

  async create(dto: CreateMenuDto) {
    const [row] = await this.db
      .insert(schema.menu)
      .values({ items: dto.items })
      .returning();

    return row;
  }

  async update(dto: UpdateMenuDto) {
    const [row] = await this.db
      .update(schema.menu)
      .set({ items: dto.items })
      .where(eq(schema.menu.id, dto.id))
      .returning();

    return row;
  }
}
