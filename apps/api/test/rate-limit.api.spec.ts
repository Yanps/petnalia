import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createTestApp } from './helpers/app-factory';
import { setupTestDatabase, type TestDatabase } from './helpers/database';

describe('Rate limiting (integração)', () => {
  let db: TestDatabase;
  let app: INestApplication;

  beforeAll(async () => {
    db = await setupTestDatabase();
    app = await createTestApp(db.url, { rateLimit: true });
  }, 120_000);

  afterAll(async () => {
    await app?.close();
    await db?.teardown();
  });

  it('bloqueia tentativas de login em sequência com 429 RATE_LIMITED', async () => {
    const attempt = () =>
      request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ email: 'ninguem@petnalia.test', password: 'senha-errada' });

    for (let i = 0; i < 10; i++) {
      const res = await attempt();
      expect(res.status).toBe(401);
    }

    const blocked = await attempt();
    expect(blocked.status).toBe(429);
    expect(blocked.body.error).toEqual({
      code: 'RATE_LIMITED',
      message: 'Muitas tentativas em pouco tempo. Aguarde um instante e tente novamente.',
    });
  });

  it('não limita rotas públicas comuns no mesmo ritmo', async () => {
    for (let i = 0; i < 15; i++) {
      const res = await request(app.getHttpServer()).get('/v1/veterinarians/specialties');
      expect(res.status).toBe(200);
    }
  });
});
