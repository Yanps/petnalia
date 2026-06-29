import type { INestApplication } from '@nestjs/common';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';

import { setupTestDatabase, type TestDatabase } from './helpers/database';
import { createTestApp } from './helpers/app-factory';
import { makeRegisterInput } from './factories/user.factory';

const REFRESH_COOKIE = 'petnalia_refresh';

describe('Auth API (integração)', () => {
  let db: TestDatabase;
  let app: INestApplication;

  beforeAll(async () => {
    db = await setupTestDatabase();
    app = await createTestApp(db.url);
  }, 120_000);

  afterAll(async () => {
    await app.close();
    await db.teardown();
  });

  beforeEach(async () => {
    await db.clear();
  });

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function post(path: string) {
    return request(app.getHttpServer()).post(path);
  }

  async function register(overrides = {}) {
    const body = makeRegisterInput(overrides);
    const res = await post('/v1/auth/register').send(body);
    return { res, body };
  }

  async function login(email: string, password: string) {
    return post('/v1/auth/login').send({ email, password });
  }

  function extractRefreshCookie(res: request.Response): string {
    const header: string | string[] | undefined = res.headers['set-cookie'];
    const cookies = Array.isArray(header) ? header : [header ?? ''];
    const cookie = cookies.find((c) => c.includes(REFRESH_COOKIE)) ?? '';
    const value = cookie.split(';')[0]?.split('=')[1] ?? '';
    return value;
  }

  // ── POST /v1/auth/register ───────────────────────────────────────────────────

  describe('POST /v1/auth/register', () => {
    it('201 + accessToken + cookie de refresh para dados válidos', async () => {
      const { res } = await register();

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        accessToken: expect.any(String),
        expiresIn: expect.any(Number),
      });

      const cookie = extractRefreshCookie(res);
      expect(cookie.length).toBeGreaterThan(20);
    });

    it('409 AUTH_EMAIL_TAKEN se e-mail já foi cadastrado', async () => {
      const { body } = await register();
      const res2 = await post('/v1/auth/register').send(body);

      expect(res2.status).toBe(409);
      expect(res2.body.error.code).toBe('AUTH_EMAIL_TAKEN');
    });

    it('422 VALIDATION_ERROR para formato de e-mail inválido', async () => {
      const res = await post('/v1/auth/register').send(
        makeRegisterInput({ email: 'not-an-email' }),
      );

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('422 VALIDATION_ERROR para senha curta demais', async () => {
      const res = await post('/v1/auth/register').send(
        makeRegisterInput({ password: '123' }),
      );

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // ── POST /v1/auth/login ──────────────────────────────────────────────────────

  describe('POST /v1/auth/login', () => {
    it('200 + accessToken para credenciais válidas', async () => {
      const { body: input } = await register();
      const res = await login(input.email, input.password);

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeTypeOf('string');
    });

    it('401 AUTH_INVALID_CREDENTIALS para senha errada', async () => {
      const { body: input } = await register();
      const res = await login(input.email, 'senha-errada');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('AUTH_INVALID_CREDENTIALS');
    });

    it('401 AUTH_INVALID_CREDENTIALS para e-mail inexistente', async () => {
      const res = await login('naoexiste@petnalia.test', 'Senha@12345');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('AUTH_INVALID_CREDENTIALS');
    });

    it('accessToken é um JWT válido (três partes separadas por ponto)', async () => {
      const { body: input } = await register();
      const res = await login(input.email, input.password);
      const parts = (res.body.accessToken as string).split('.');

      expect(parts).toHaveLength(3);
    });
  });

  // ── POST /v1/auth/refresh ────────────────────────────────────────────────────

  describe('POST /v1/auth/refresh', () => {
    it('200 + novo accessToken com cookie de refresh válido', async () => {
      const { res: regRes } = await register();
      const refreshCookie = extractRefreshCookie(regRes);

      const res = await post('/v1/auth/refresh').set(
        'Cookie',
        `${REFRESH_COOKIE}=${refreshCookie}`,
      );

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeTypeOf('string');
    });

    it('401 quando não há cookie de refresh', async () => {
      const res = await post('/v1/auth/refresh');
      expect(res.status).toBe(401);
    });

    it('401 AUTH_TOKEN_REVOKED ao reutilizar o mesmo token (proteção contra roubo)', async () => {
      const { res: regRes } = await register();
      const refreshCookie = extractRefreshCookie(regRes);

      // Primeira rotação: consome o token original
      await post('/v1/auth/refresh').set('Cookie', `${REFRESH_COOKIE}=${refreshCookie}`);

      // Segunda rotação com o mesmo token revogado
      const res = await post('/v1/auth/refresh').set(
        'Cookie',
        `${REFRESH_COOKIE}=${refreshCookie}`,
      );

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('AUTH_TOKEN_REVOKED');
    });
  });

  // ── POST /v1/auth/logout ─────────────────────────────────────────────────────

  describe('POST /v1/auth/logout', () => {
    it('204 e limpa o cookie após logout autenticado', async () => {
      const { res: regRes } = await register();
      const accessToken = regRes.body.accessToken as string;
      const refreshCookie = extractRefreshCookie(regRes);

      const res = await post('/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `${REFRESH_COOKIE}=${refreshCookie}`);

      expect(res.status).toBe(204);

      const setCookie: string | string[] | undefined = res.headers['set-cookie'];
      const cookies = Array.isArray(setCookie) ? setCookie : [setCookie ?? ''];
      const cleared = cookies.find((c) => c.includes(REFRESH_COOKIE));
      // Cookie is cleared when value is empty or Expires is in the past
      expect(cleared).toBeDefined();
      expect(cleared).toMatch(/petnalia_refresh=;|Expires=Thu, 01 Jan 1970/i);
    });

    it('204 mesmo sem cookie de refresh (idempotente)', async () => {
      const { res: regRes } = await register();
      const accessToken = regRes.body.accessToken as string;

      const res = await post('/v1/auth/logout').set(
        'Authorization',
        `Bearer ${accessToken}`,
      );

      expect(res.status).toBe(204);
    });
  });

  // ── Rotas protegidas ─────────────────────────────────────────────────────────

  describe('Rotas protegidas', () => {
    it('401 quando Authorization header está ausente', async () => {
      // /v1/auth/logout is the only non-@Public() auth route
      const res = await post('/v1/auth/logout');
      expect(res.status).toBe(401);
    });

    it('401 quando Bearer token é inválido', async () => {
      const res = await post('/v1/auth/logout').set(
        'Authorization',
        'Bearer token.invalido.aqui',
      );
      expect(res.status).toBe(401);
    });
  });
});
