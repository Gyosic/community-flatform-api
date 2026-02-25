import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import * as schema from '../database/schema';
import { CreatePageDto, UpdatePageDto } from './dto/create-page.dto';

function generateSlug(type: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let guid = '';
  for (let i = 0; i < 11; i++) {
    guid += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${type}/${guid}`;
}

@Injectable()
export class PagesService {
  constructor(
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
  ) {}

  async findAll() {
    return this.db.select().from(schema.pages);
  }

  async findOne(id: string) {
    const [page] = await this.db
      .select()
      .from(schema.pages)
      .where(eq(schema.pages.id, id))
      .limit(1);

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    return page;
  }

  async create(dto: CreatePageDto) {
    const slug = generateSlug(dto.type);

    const [page] = await this.db
      .insert(schema.pages)
      .values({
        name: dto.name,
        type: dto.type,
        slug,
        description: dto.description ?? null,
        parent_id: dto.parent_id ?? null,
        config: dto.config as typeof schema.pages.$inferInsert['config'],
        display_config: dto.display_config as typeof schema.pages.$inferInsert['display_config'],
        layout: dto.layout as typeof schema.pages.$inferInsert['layout'],
      })
      .returning();

    return page;
  }

  async update(id: string, dto: UpdatePageDto) {
    await this.findOne(id);

    const updateData: Record<string, unknown> = {
      updated_at: new Date(),
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.parent_id !== undefined) updateData.parent_id = dto.parent_id;
    if (dto.config !== undefined) updateData.config = dto.config;
    if (dto.display_config !== undefined) updateData.display_config = dto.display_config;
    if (dto.layout !== undefined) updateData.layout = dto.layout;

    const [page] = await this.db
      .update(schema.pages)
      .set(updateData)
      .where(eq(schema.pages.id, id))
      .returning();

    return page;
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.db.delete(schema.pages).where(eq(schema.pages.id, id));

    return { success: true };
  }
}
