import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { pages } from './pages';
import { users } from './users';

export const posts = pgTable('posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  page_id: uuid('page_id')
    .notNull()
    .references(() => pages.id, { onDelete: 'cascade' }),
  author_id: uuid('author_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  is_anonymous: boolean('is_anonymous').notNull().default(false),
  title: text('title').notNull(),
  content: text('content').notNull(),
  content_html: text('content_html'),
  view_count: integer('view_count').notNull().default(0),
  like_count: integer('like_count').notNull().default(0),
  dislike_count: integer('dislike_count').notNull().default(0),
  comment_count: integer('comment_count').notNull().default(0),
  is_published: boolean('is_published').notNull().default(true),
  is_pinned: boolean('is_pinned').notNull().default(false),
  is_locked: boolean('is_locked').notNull().default(false),
  is_deleted: boolean('is_deleted').notNull().default(false),
  needs_approval: boolean('needs_approval').notNull().default(false),
  approved_at: timestamp('approved_at'),
  approved_by: uuid('approved_by'),
  last_comment_at: timestamp('last_comment_at'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export interface FileType {
  name: string;
  lastModified: number;
  type: string;
  size: number;
  src: string;
}

export const postAttachments = pgTable('post_attachments', {
  id: uuid('id').defaultRandom().primaryKey(),
  post_id: uuid('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  files: jsonb('files').$type<FileType[]>(),
  width: integer('width'),
  height: integer('height'),
  thumbnail_url: text('thumbnail_url'),
  download_count: integer('download_count').notNull().default(0),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type PostAttachment = typeof postAttachments.$inferSelect;
export type NewPostAttachment = typeof postAttachments.$inferInsert;
