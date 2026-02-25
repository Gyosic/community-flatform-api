import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const roles = pgTable('roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  display_name: text('display_name').notNull(),
  description: text('description'),
  min_level: integer('min_level').notNull().default(1),
  max_level: integer('max_level'),
  priority: integer('priority').notNull().default(0),
  color: text('color'),
  badge_config: jsonb('badge_config').$type<{
    icon?: string;
    background_color?: string;
    text_color?: string;
  }>(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export const permissions = pgTable('permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  role_id: uuid('role_id')
    .notNull()
    .references(() => roles.id, { onDelete: 'cascade' }),
  board_id: uuid('board_id'),
  can_read: integer('can_read').notNull().default(1),
  can_write: integer('can_write').notNull().default(0),
  can_comment: integer('can_comment').notNull().default(0),
  can_delete: integer('can_delete').notNull().default(0),
  can_edit: integer('can_edit').notNull().default(0),
  can_pin: integer('can_pin').notNull().default(0),
  can_manage: integer('can_manage').notNull().default(0),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
