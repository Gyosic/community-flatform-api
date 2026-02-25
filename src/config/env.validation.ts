import { z } from 'zod';

const envSchema = z.object({
  // Database (required)
  DATABASE_URL: z.string().min(1),

  // Redis (required)
  REDIS_URL: z.string().min(1).optional(),

  // Application
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3000),

  // Auth (required)
  SYSADMIN_EMAIL: z.string().min(1),
  SYSADMIN_NAME: z.string().min(1),
  SYSADMIN_PASSWORD: z.string().min(1),
  AUTH_SECRET: z.string().min(1),

  // File Upload (required)
  MAX_FILE_SIZE: z.coerce.number().positive(),
  FILE_STORAGE_ROOT: z.string().min(1),
  ALLOWED_FILE_TYPES: z.string().min(1),

  // Optional
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  AI_ENABLED: z.preprocess(
    (v) => (v === undefined ? 'false' : v),
    z.enum(['true', 'false']).transform((v) => v === 'true'),
  ),
  SENTRY_DSN: z.string().optional(),
});

export function validate(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${errors}`);
  }

  return result.data;
}
