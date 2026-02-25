import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const siteSettings = pgTable('site_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  site_name: text('site_name').notNull(),
  site_description: text('site_description'),
  theme_config: jsonb('theme_config').$type<Record<string, unknown>>(),
  permission_config:
    jsonb('permission_config').$type<Record<string, unknown>>(),
  features_config: jsonb('features_config').$type<Record<string, unknown>>(),
  seo_config: jsonb('seo_config').$type<Record<string, unknown>>(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type NewSiteSetting = typeof siteSettings.$inferInsert;
