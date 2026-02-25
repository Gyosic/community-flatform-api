import { Inject, Injectable } from '@nestjs/common';
import { and, asc, desc, eq, getTableColumns, like, SQL } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import * as schema from '../database/schema';
import { GetPostsDto } from './dto/get-posts.dto';

const postColumns = getTableColumns(schema.posts);
const userColumns = getTableColumns(schema.users);
const pageColumns = getTableColumns(schema.pages);

type PostColumn = keyof typeof postColumns;

@Injectable()
export class PostsService {
  constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

  async findAll(dto: GetPostsDto) {
    const { sorts, from, size, board_type, title, user_name } = dto;

    const conditions: SQL[] = [];
    if (board_type) conditions.push(eq(schema.pages.type, board_type));
    if (title) conditions.push(like(schema.posts.title, `%${title}%`));
    if (user_name) conditions.push(like(schema.users.name, `%${user_name}%`));

    let query = this.db
      .select({
        ...postColumns,
        user: userColumns,
        page: pageColumns,
      })
      .from(schema.posts)
      .innerJoin(schema.pages, eq(schema.pages.id, schema.posts.page_id))
      .innerJoin(schema.users, eq(schema.users.id, schema.posts.author_id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .$dynamic();

    if (sorts) {
      const sortOrders = sorts.split(',').map((s) => {
        const [key, order] = s.split(':');
        if (order === 'desc') return desc(schema.posts[key as PostColumn]);
        return asc(schema.posts[key as PostColumn]);
      });
      query = query.orderBy(...sortOrders);
    }

    if (size !== undefined && from !== undefined) {
      query = query.limit(size).offset(from);
    }

    return query;
  }

  async findOne(id: string) {
    const [post] = await this.db
      .select({
        ...postColumns,
        user: userColumns,
        page: pageColumns,
      })
      .from(schema.posts)
      .innerJoin(schema.pages, eq(schema.pages.id, schema.posts.page_id))
      .innerJoin(schema.users, eq(schema.users.id, schema.posts.author_id))
      .where(eq(schema.posts.id, id))
      .limit(1);

    return post || null;
  }
}
