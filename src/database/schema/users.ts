import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { roles } from './roles';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  emailVerified: timestamp('emailVerified'),
  password: text('password').notNull(),
  image: text('image'),
  bio: text('bio'),
  profile_config: jsonb('profile_config').$type<{
    custom_fields?: Record<string, string>;
    social_links?: {
      twitter?: string;
      github?: string;
      website?: string;
    };
  }>(),
  role_id: uuid('role_id')
    .notNull()
    .references(() => roles.id, { onDelete: 'restrict' }),
  level: integer('level').notNull().default(1),
  experience: integer('experience').notNull().default(0),
  posts_count: integer('posts_count').notNull().default(0),
  comments_count: integer('comments_count').notNull().default(0),
  is_active: boolean('is_active').notNull().default(true),
  is_email_verified: boolean('is_email_verified').notNull().default(false),
  is_banned: boolean('is_banned').notNull().default(false),
  banned_until: timestamp('banned_until'),
  banned_reason: text('banned_reason'),
  last_login_at: timestamp('last_login_at'),
  last_active_at: timestamp('last_active_at'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export const accounts = pgTable(
  'account',
  {
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
