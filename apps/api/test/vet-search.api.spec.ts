import type { INestApplication } from '@nestjs/common';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';

import { PrismaService } from '../src/shared/prisma/prisma.service';
import { setupTestDatabase, type TestDatabase } from './helpers/database';
import { createTestApp } from './helpers/app-factory';

// São Paulo city centre
const SP = { lat: -23.5505, lng: -46.6333 };

async function seedVerifiedVet(app: INestApplication, opts: {
  email: string;
  fullName: string;
  lat: number;
  lng: number;
}) {
  const prisma = app.get(PrismaService);

  const user = await prisma.user.create({
    data: {
      email: opts.email,
      passwordHash: '$argon2id$v=19$test',
      role: 'veterinarian',
      profile: { create: { fullName: opts.fullName } },
    },
  });

  await prisma.veterinarian.create({
    data: {
      userId: user.id,
      crmv: 'SP00001',
      crmvState: 'SP',
      verificationStatus: 'verified',
    },
  });

  await prisma.$executeRaw`
    INSERT INTO addresses (
      "userId", street, number, neighborhood, city, state, cep, geog, "createdAt", "updatedAt"
    ) VALUES (
      ${user.id}::uuid,
      'Rua Teste', '1', 'Centro', 'São Paulo', 'SP', '01001-000',
      ST_SetSRID(ST_MakePoint(${opts.lng}::float8, ${opts.lat}::float8), 4326)::geography,
      NOW(), NOW()
    )
  `;
}

describe('GET /v1/veterinarians/search (integração)', () => {
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

  function get(qs: string) {
    return request(app.getHttpServer()).get(`/v1/veterinarians/search?${qs}`);
  }

  describe('validação de entrada', () => {
    it('422 VALIDATION_ERROR quando lat/lng ausentes', async () => {
      const res = await get('radiusKm=20');
      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('422 VALIDATION_ERROR para lat fora do intervalo', async () => {
      const res = await get('lat=200&lng=-46.63');
      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('resultados', () => {
    it('200 com lista vazia quando não há vets no banco', async () => {
      const res = await get(`lat=${SP.lat}&lng=${SP.lng}&radiusKm=20`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.total).toBe(0);
      expect(res.body.hasMore).toBe(false);
    });

    it('200 retorna vet verificado dentro do raio', async () => {
      await seedVerifiedVet(app, {
        email: 'vet@test.com',
        fullName: 'Dr. Busca',
        lat: SP.lat,
        lng: SP.lng,
      });

      const res = await get(`lat=${SP.lat}&lng=${SP.lng}&radiusKm=20`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].fullName).toBe('Dr. Busca');
      expect(res.body.data[0].distanceKm).toBeTypeOf('number');
      expect(res.body.data[0].slug).toBeTypeOf('string');
      expect(res.body.data[0].verificationStatus).toBe('verified');
    });

    it('não retorna vet pendente na busca', async () => {
      const prisma = app.get(PrismaService);

      const user = await prisma.user.create({
        data: {
          email: 'pending@test.com',
          passwordHash: '$argon2id$v=19$test',
          role: 'veterinarian',
          profile: { create: { fullName: 'Dr. Pendente' } },
        },
      });

      await prisma.veterinarian.create({
        data: { userId: user.id, crmv: 'SP99999', crmvState: 'SP', verificationStatus: 'pending' },
      });

      await prisma.$executeRaw`
        INSERT INTO addresses ("userId", street, number, neighborhood, city, state, cep, geog, "createdAt", "updatedAt")
        VALUES (${user.id}::uuid, 'Rua A', '1', 'B', 'SP', 'SP', '00000-000',
          ST_SetSRID(ST_MakePoint(${SP.lng}::float8, ${SP.lat}::float8), 4326)::geography, NOW(), NOW())
      `;

      const res = await get(`lat=${SP.lat}&lng=${SP.lng}&radiusKm=20`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it('resposta tem shape correto (page, limit, hasMore)', async () => {
      const res = await get(`lat=${SP.lat}&lng=${SP.lng}&radiusKm=20&page=1&limit=5`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        data: expect.any(Array),
        total: expect.any(Number),
        page: 1,
        limit: 5,
        hasMore: expect.any(Boolean),
      });
    });

    it('rota é pública — sem Authorization header funciona', async () => {
      const res = await get(`lat=${SP.lat}&lng=${SP.lng}`);
      expect(res.status).not.toBe(401);
    });
  });
});
