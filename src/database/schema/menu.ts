import { jsonb, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

export interface MenuItem {
  id: string;
  label: string;
  href?: string;
  children?: MenuItem[];
}

export const menu = pgTable('menu', {
  id: uuid('id').defaultRandom().primaryKey(),
  items: jsonb('items').$type<MenuItem[]>(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export type Menu = typeof menu.$inferSelect;
export type NewMenu = typeof menu.$inferInsert;
