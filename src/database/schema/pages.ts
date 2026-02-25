import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const pages = pgTable('pages', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  name: text('name').notNull(),
  type: text('type').notNull().default('general'),
  parent_id: uuid('parent_id'),
  config: jsonb('config').$type<{
    allow_anonymous: boolean;
    allow_comments: boolean;
    allow_nested_comments: boolean;
    allow_attachments: boolean;
    max_attachment_size: number;
    allowed_file_types: string[];
    require_approval: boolean;
  }>(),
  display_config: jsonb('display_config').$type<{
    show_author: boolean;
    show_view_count: boolean;
    show_like_count: boolean;
  }>(),
  layout: jsonb('layout').$type<
    {
      i: string;
      x: number;
      y: number;
      w: number;
      h: number;
      component?: {
        id: string;
        props: Record<string, unknown>;
      };
    }[]
  >(),
  posts_count: integer('posts_count').notNull().default(0),
  today_posts_count: integer('today_posts_count').notNull().default(0),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;
