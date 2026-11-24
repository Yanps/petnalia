import { z } from 'zod';

/**
 * Environment validation for the apps. Each app calls its parser once at startup so a
 * missing or malformed variable stops the process with a clear message instead of
 * surfacing later as `undefined` (ADR-0001).
 *
 * Values stay strings on purpose: call sites keep reading them through `process.env` /
 * `ConfigService` with their own defaults, so validation never changes runtime behavior.
 *
 * In production, every variable that has a local-development default must be set
 * explicitly, and the sample values from `.env.example` are rejected.
 */

const NodeEnvSchema = z.enum(['development', 'test', 'production']).default('development');

const url = z.url({ error: 'URL inválida' });
const positiveInt = z.string().regex(/^[1-9]\d*$/, { error: 'deve ser um inteiro positivo' });
const jwtSecret = z.string({ error: 'obrigatório' }).min(32, { error: 'mínimo de 32 caracteres' });

/** Placeholder values shipped in `.env.example` / docker-compose — never valid in production. */
const SAMPLE_VALUE = /^(change-me|minioadmin$|sk_test_$|whsec_$)/;
const LOCAL_HOST = /^(https?:\/\/)?(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/;

type ProductionRule = {
  readonly key: string;
  readonly check?: (value: string) => string | null;
};

const notSample = (value: string): string | null =>
  SAMPLE_VALUE.test(value) ? 'valor de exemplo não é permitido em produção' : null;
const notLocal = (value: string): string | null =>
  LOCAL_HOST.test(value) ? 'não pode apontar para localhost em produção' : null;
const httpsOnly = (value: string): string | null =>
  value.startsWith('https://') ? notLocal(value) : 'deve usar https em produção';

function requireInProduction(rules: readonly ProductionRule[]) {
  return (env: { readonly NODE_ENV: string } & Readonly<Record<string, unknown>>, ctx: z.RefinementCtx): void => {
    if (env.NODE_ENV !== 'production') return;
    for (const { key, check } of rules) {
      const value = env[key];
      if (typeof value !== 'string' || value.length === 0) {
        ctx.addIssue({ code: 'custom', path: [key], message: 'obrigatório em produção' });
        continue;
      }
      const problem = check?.(value) ?? null;
      if (problem) ctx.addIssue({ code: 'custom', path: [key], message: problem });
    }
  };
}

// ── API (apps/api) ──────────────────────────────────────────────────────────

export const ApiEnvSchema = z
  .object({
    NODE_ENV: NodeEnvSchema,
    PORT: positiveInt.optional(),
    APP_URL: url.optional(),
    TRUST_PROXY: z.string().optional(),
    RATE_LIMIT_AUTH_PER_MINUTE: positiveInt.optional(),

    DATABASE_URL: url,
    REDIS_URL: url.optional(),

    JWT_ACCESS_SECRET: jwtSecret,
    JWT_ACCESS_TTL: z.string().optional(),
    JWT_REFRESH_TTL: z.string().optional(),

    S3_ENDPOINT: url.optional(),
    S3_REGION: z.string().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_BUCKET: z.string().optional(),
    S3_FORCE_PATH_STYLE: z.enum(['true', 'false']).optional(),

    SMTP_HOST: z.string().optional(),
    SMTP_PORT: positiveInt.optional(),
    SMTP_SECURE: z.enum(['true', 'false']).optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().optional(),

    STRIPE_SECRET_KEY: z.string().startsWith('sk_', { error: 'deve começar com sk_' }).optional(),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_', { error: 'deve começar com whsec_' }).optional(),
    STRIPE_PRICE_PRO: z.string().optional(),
    STRIPE_PRICE_CLINIC: z.string().optional(),

    SENTRY_DSN: url.optional(),
    SENTRY_ENVIRONMENT: z.string().optional(),
  })
  .superRefine(
    requireInProduction([
      { key: 'APP_URL', check: httpsOnly },
      { key: 'REDIS_URL', check: notLocal },
      { key: 'JWT_ACCESS_SECRET', check: notSample },
      { key: 'S3_ENDPOINT', check: notLocal },
      { key: 'S3_ACCESS_KEY_ID', check: notSample },
      { key: 'S3_SECRET_ACCESS_KEY', check: notSample },
      { key: 'S3_BUCKET' },
      { key: 'SMTP_HOST', check: notLocal },
      { key: 'SMTP_FROM' },
      { key: 'STRIPE_SECRET_KEY', check: notSample },
      { key: 'STRIPE_WEBHOOK_SECRET', check: notSample },
      { key: 'STRIPE_PRICE_PRO' },
      { key: 'STRIPE_PRICE_CLINIC' },
    ]),
  );

export type ApiEnv = z.infer<typeof ApiEnvSchema>;

// ── Web (apps/web, server side) ─────────────────────────────────────────────

export const WebEnvSchema = z
  .object({
    NODE_ENV: NodeEnvSchema,
    /** Public URL of the site (canonical links, sitemap, robots). */
    APP_URL: url.optional(),
    /** Base URL the Next server uses for the same-origin proxy and Server Actions. */
    API_URL: url.optional(),
    /** Base URL Server Components use to call the API. */
    API_INTERNAL_URL: url.optional(),
    /** Public API URL, inlined in the client bundle at build time. */
    NEXT_PUBLIC_API_URL: url.optional(),
    /** Same secret as the API — the middleware verifies the access token's signature. */
    JWT_ACCESS_SECRET: jwtSecret,
    NEXT_PUBLIC_SENTRY_DSN: url.optional(),
  })
  .superRefine(
    requireInProduction([
      { key: 'APP_URL', check: httpsOnly },
      { key: 'API_URL' },
      { key: 'API_INTERNAL_URL' },
      { key: 'JWT_ACCESS_SECRET', check: notSample },
    ]),
  );

export type WebEnv = z.infer<typeof WebEnvSchema>;

// ── Feature flags ───────────────────────────────────────────────────────────

const flag = z.string().default('false').transform((v) => v === 'true');

const FeatureFlagSchema = z.object({
  FEATURE_MAGIC_LINK: flag,
  FEATURE_GOOGLE_OAUTH: flag,
  FEATURE_WHATSAPP: flag,
  FEATURE_POLYGON_SERVICE_AREA: flag,
});

export type FeatureFlags = z.infer<typeof FeatureFlagSchema>;

// ── Parsers ─────────────────────────────────────────────────────────────────

type RawEnv = Readonly<Record<string, string | undefined>>;

/** Thrown when env validation fails. Lists variable names and reasons — never values. */
export class EnvValidationError extends Error {
  readonly variables: readonly string[];

  constructor(app: string, issues: readonly z.core.$ZodIssue[]) {
    const lines = issues.map((issue) => `  - ${issue.path.join('.') || '(raiz)'}: ${issue.message}`);
    super(`Variáveis de ambiente inválidas (${app}):\n${lines.join('\n')}`);
    this.name = 'EnvValidationError';
    this.variables = [...new Set(issues.map((issue) => String(issue.path[0] ?? '')))];
  }
}

function parseWith<T extends z.ZodType>(app: string, schema: T, raw: RawEnv): z.infer<T> {
  const result = schema.safeParse(raw);
  if (!result.success) throw new EnvValidationError(app, result.error.issues);
  return result.data;
}

/** Validates the API's environment. Throws `EnvValidationError` on failure. */
export function parseApiEnv(raw: RawEnv = process.env): ApiEnv {
  return parseWith('api', ApiEnvSchema, raw);
}

/** Validates the web server's environment. Throws `EnvValidationError` on failure. */
export function parseWebEnv(raw: RawEnv = process.env): WebEnv {
  return parseWith('web', WebEnvSchema, raw);
}

export function parseFeatureFlags(raw: RawEnv = process.env): FeatureFlags {
  return FeatureFlagSchema.parse(raw);
}
