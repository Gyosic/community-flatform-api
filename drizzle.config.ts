import type { Config } from 'drizzle-kit';

const postgresql = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT || 5432),
  user: decodeURIComponent(process.env.DATABASE_USER || 'postgres'),
  password: process.env.DATABASE_PASSWORD
    ? decodeURIComponent(process.env.DATABASE_PASSWORD)
    : undefined,
  database: process.env.DATABASE_NAME || 'cafe_service',
  ssl: false,
};

export default {
  dialect: 'postgresql',
  schema: './src/database/schema',
  out: './drizzle',
  migrations: {
    schema: 'public',
  },
  dbCredentials: postgresql,
  strict: true,
  extensionsFilters: ['postgis'],
} satisfies Config;
