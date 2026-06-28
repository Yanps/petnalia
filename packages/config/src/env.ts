import { z } from 'zod';

const ServerEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_URL: z.string().url(),
  API_URL: z.string().url(),

  // Database
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),

  // Redis
  REDIS_URL: z.string().url(),

  // Auth
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('30d'),

  // Storage
  S3_ENDPOINT: z.string().url(),
  S3_REGION: z.string().default('us-east-1'),
  S3_ACCESS_KEY_ID: z.string(),
  S3_SECRET_ACCESS_KEY: z.string(),
  S3_BUCKET: z.string(),
  S3_FORCE_PATH_STYLE: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),

  // Email
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number().default(1025),
  SMTP_FROM: z.string(),

  // Billing
  STRIPE_SECRET_KEY: z.string().startsWith('sk_').optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_').optional(),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

const ClientEnvSchema = z.object({
  NEXT_PUBLIC_MAPBOX_TOKEN: z.string().optional(),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
});

export type ClientEnv = z.infer<typeof ClientEnvSchema>;

const FeatureFlagSchema = z.object({
  FEATURE_MAGIC_LINK: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),
  FEATURE_GOOGLE_OAUTH: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),
  FEATURE_WHATSAPP: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),
  FEATURE_POLYGON_SERVICE_AREA: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),
});

export type FeatureFlags = z.infer<typeof FeatureFlagSchema>;

/**
 * Parses and validates server-side environment variables.
 * Call this at app startup — throws if any required var is missing or malformed.
 */
export function parseServerEnv(raw: NodeJS.ProcessEnv = process.env): ServerEnv {
  return ServerEnvSchema.parse(raw);
}

export function parseFeatureFlags(raw: NodeJS.ProcessEnv = process.env): FeatureFlags {
  return FeatureFlagSchema.parse(raw);
}
