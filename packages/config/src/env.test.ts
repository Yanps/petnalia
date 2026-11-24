import { describe, expect, it } from 'vitest';

import { EnvValidationError, parseApiEnv, parseFeatureFlags, parseWebEnv } from './env.js';

const SECRET = 'a-real-secret-with-more-than-32-characters';

const DEV_API_ENV = {
  NODE_ENV: 'development',
  DATABASE_URL: 'postgresql://petnalia:petnalia@localhost:5432/petnalia',
  JWT_ACCESS_SECRET: 'change-me-min-32-chars-access-secret',
};

const PROD_API_ENV = {
  NODE_ENV: 'production',
  APP_URL: 'https://petnalia.com.br',
  DATABASE_URL: 'postgresql://user:pass@db.internal:5432/petnalia',
  REDIS_URL: 'redis://redis.internal:6379',
  JWT_ACCESS_SECRET: SECRET,
  S3_ENDPOINT: 'https://s3.sa-east-1.amazonaws.com',
  S3_ACCESS_KEY_ID: 'AKIAEXAMPLE',
  S3_SECRET_ACCESS_KEY: 'prod-secret-key',
  S3_BUCKET: 'petnalia-prod',
  SMTP_HOST: 'smtp.provedor.com',
  SMTP_FROM: 'PetNalia <nao-responda@petnalia.com.br>',
  STRIPE_SECRET_KEY: 'sk_live_123',
  STRIPE_WEBHOOK_SECRET: 'whsec_123',
  STRIPE_PRICE_PRO: 'price_pro',
  STRIPE_PRICE_CLINIC: 'price_clinic',
};

function failedVars(fn: () => unknown): readonly string[] {
  try {
    fn();
  } catch (error) {
    if (error instanceof EnvValidationError) return error.variables;
    throw error;
  }
  throw new Error('expected env validation to fail');
}

describe('parseApiEnv', () => {
  it('aceita o mínimo em desenvolvimento', () => {
    expect(parseApiEnv(DEV_API_ENV).NODE_ENV).toBe('development');
  });

  it('assume development quando NODE_ENV não está definido', () => {
    const { NODE_ENV: _omit, ...raw } = DEV_API_ENV;
    expect(parseApiEnv(raw).NODE_ENV).toBe('development');
  });

  it('exige DATABASE_URL e JWT_ACCESS_SECRET em qualquer ambiente', () => {
    expect(failedVars(() => parseApiEnv({ NODE_ENV: 'development' }))).toEqual(
      expect.arrayContaining(['DATABASE_URL', 'JWT_ACCESS_SECRET']),
    );
  });

  it('rejeita JWT_ACCESS_SECRET com menos de 32 caracteres', () => {
    expect(failedVars(() => parseApiEnv({ ...DEV_API_ENV, JWT_ACCESS_SECRET: 'curto' }))).toEqual([
      'JWT_ACCESS_SECRET',
    ]);
  });

  it('rejeita números malformados', () => {
    expect(
      failedVars(() =>
        parseApiEnv({ ...DEV_API_ENV, SMTP_PORT: 'abc', RATE_LIMIT_AUTH_PER_MINUTE: '0' }),
      ),
    ).toEqual(expect.arrayContaining(['SMTP_PORT', 'RATE_LIMIT_AUTH_PER_MINUTE']));
  });

  it('aceita uma configuração de produção completa', () => {
    expect(parseApiEnv(PROD_API_ENV).NODE_ENV).toBe('production');
  });

  it('trata variável vazia (KEY= no .env) como não definida', () => {
    expect(parseApiEnv({ ...DEV_API_ENV, SENTRY_DSN: '', SMTP_PORT: '' }).SENTRY_DSN).toBeUndefined();
    expect(failedVars(() => parseApiEnv({ ...PROD_API_ENV, STRIPE_SECRET_KEY: '' }))).toEqual(['STRIPE_SECRET_KEY']);
  });

  it('exige em produção as variáveis que têm default de desenvolvimento', () => {
    const vars = failedVars(() =>
      parseApiEnv({
        NODE_ENV: 'production',
        DATABASE_URL: PROD_API_ENV.DATABASE_URL,
        JWT_ACCESS_SECRET: SECRET,
      }),
    );
    expect(vars).toEqual(
      expect.arrayContaining([
        'APP_URL',
        'REDIS_URL',
        'S3_ENDPOINT',
        'S3_ACCESS_KEY_ID',
        'S3_SECRET_ACCESS_KEY',
        'S3_BUCKET',
        'SMTP_HOST',
        'SMTP_FROM',
        'STRIPE_SECRET_KEY',
        'STRIPE_WEBHOOK_SECRET',
        'STRIPE_PRICE_PRO',
        'STRIPE_PRICE_CLINIC',
      ]),
    );
  });

  it('rejeita em produção os valores de exemplo do .env.example', () => {
    const vars = failedVars(() =>
      parseApiEnv({
        ...PROD_API_ENV,
        APP_URL: 'http://localhost:3000',
        JWT_ACCESS_SECRET: 'change-me-min-32-chars-access-secret',
        S3_ACCESS_KEY_ID: 'minioadmin',
        S3_SECRET_ACCESS_KEY: 'minioadmin',
        SMTP_HOST: 'localhost',
      }),
    );
    expect([...vars].sort()).toEqual(
      ['APP_URL', 'JWT_ACCESS_SECRET', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY', 'SMTP_HOST'].sort(),
    );
  });

  it('nunca inclui o valor das variáveis na mensagem de erro', () => {
    try {
      parseApiEnv({ ...PROD_API_ENV, JWT_ACCESS_SECRET: 'change-me-but-this-is-the-secret-value' });
      expect.unreachable();
    } catch (error) {
      expect(String(error)).toContain('JWT_ACCESS_SECRET');
      expect(String(error)).not.toContain('this-is-the-secret-value');
    }
  });
});

describe('parseWebEnv', () => {
  it('aceita o mínimo em desenvolvimento', () => {
    expect(parseWebEnv({ JWT_ACCESS_SECRET: 'change-me-min-32-chars-access-secret' }).NODE_ENV).toBe(
      'development',
    );
  });

  it('exige em produção as URLs da API e um segredo real', () => {
    const vars = failedVars(() =>
      parseWebEnv({ NODE_ENV: 'production', JWT_ACCESS_SECRET: 'change-me-min-32-chars-access-secret' }),
    );
    expect([...vars].sort()).toEqual(['API_INTERNAL_URL', 'API_URL', 'APP_URL', 'JWT_ACCESS_SECRET'].sort());
  });

  it('aceita uma configuração de produção completa', () => {
    const env = parseWebEnv({
      NODE_ENV: 'production',
      APP_URL: 'https://petnalia.com.br',
      JWT_ACCESS_SECRET: SECRET,
      API_URL: 'http://api.internal:4000',
      API_INTERNAL_URL: 'http://api.internal:4000',
      NEXT_PUBLIC_API_URL: 'https://api.petnalia.com.br',
    });
    expect(env.API_URL).toBe('http://api.internal:4000');
  });
});

describe('parseFeatureFlags', () => {
  it('deixa todas as flags desligadas por padrão', () => {
    expect(Object.values(parseFeatureFlags({})).every((v) => v === false)).toBe(true);
  });

  it('liga só a flag com valor "true"', () => {
    const flags = parseFeatureFlags({ FEATURE_WHATSAPP: 'true', FEATURE_MAGIC_LINK: '1' });
    expect(flags.FEATURE_WHATSAPP).toBe(true);
    expect(flags.FEATURE_MAGIC_LINK).toBe(false);
  });
});
