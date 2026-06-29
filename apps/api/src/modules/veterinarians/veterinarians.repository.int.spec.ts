import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';

import { PrismaModule } from '../../shared/prisma/prisma.module';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { VeterinariansModule } from './veterinarians.module';
import { VeterinariansRepository } from './veterinarians.repository';
import { setupTestDatabase, type TestDatabase } from '../../../test/helpers/database';

// São Paulo city centre
const SP = { lat: -23.5505, lng: -46.6333 };
// Curitiba (~350 km away)
const CWB = { lat: -25.4284, lng: -49.2733 };

interface SeedVetOpts {
  email: string;
  fullName: string;
  lat: number;
  lng: number;
  status?: 'active' | 'suspended';
  verificationStatus?: 'verified' | 'pending';
}

async function seedVet(prisma: PrismaService, opts: SeedVetOpts) {
  const user = await prisma.user.create({
    data: {
      email: opts.email,
      passwordHash: '$argon2id$v=19$test',
      role: 'veterinarian',
      status: opts.status ?? 'active',
      profile: { create: { fullName: opts.fullName } },
    },
  });

  const vet = await prisma.veterinarian.create({
    data: {
      userId: user.id,
      crmv: 'SP99999',
      crmvState: 'SP',
      verificationStatus: opts.verificationStatus ?? 'verified',
    },
  });

  // Addresses with PostGIS geography cannot be created via Prisma model methods
  // because the column is Unsupported() — raw SQL required.
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

  return { user, vet };
}

describe('VeterinariansRepository.search (integração)', () => {
  let db: TestDatabase;
  let repo: VeterinariansRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    db = await setupTestDatabase();
    process.env['DATABASE_URL'] = db.url;
    process.env['DIRECT_URL'] = db.url;
    process.env['JWT_ACCESS_SECRET'] = 'test-access-secret-at-least-32-chars!!';
    process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-min-32-chars!!!!';

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        VeterinariansModule,
      ],
    }).compile();

    await moduleRef.init();
    repo = moduleRef.get(VeterinariansRepository);
    prisma = moduleRef.get(PrismaService);
  }, 120_000);

  afterAll(async () => {
    await db.teardown();
  });

  beforeEach(async () => {
    await db.clear();
  });

  const baseParams = {
    lat: SP.lat,
    lng: SP.lng,
    radiusKm: 30,
    modality: 'any' as const,
    page: 1,
    limit: 12,
  };

  describe('busca geográfica básica', () => {
    it('retorna vet verificado dentro do raio', async () => {
      await seedVet(prisma, { email: 'vet@test.com', fullName: 'Dr. Próximo', lat: SP.lat, lng: SP.lng });

      const { rows, totalCount } = await repo.search(baseParams);

      expect(rows).toHaveLength(1);
      expect(totalCount).toBe(1);
      expect(rows[0]!.full_name).toBe('Dr. Próximo');
    });

    it('exclui vet fora do raio', async () => {
      await seedVet(prisma, { email: 'longe@test.com', fullName: 'Dr. Longe', lat: CWB.lat, lng: CWB.lng });

      const { rows } = await repo.search(baseParams);

      expect(rows).toHaveLength(0);
    });

    it('retorna lista vazia quando não há vets no banco', async () => {
      const { rows, totalCount } = await repo.search(baseParams);

      expect(rows).toHaveLength(0);
      expect(totalCount).toBe(0);
    });
  });

  describe('campos do resultado', () => {
    it('inclui distance_km calculada corretamente', async () => {
      // Ponto a exatos 0 km do centro de SP
      await seedVet(prisma, { email: 'sp@test.com', fullName: 'Dr. SP', lat: SP.lat, lng: SP.lng });

      const { rows } = await repo.search(baseParams);

      expect(rows[0]!.distance_km).toBeCloseTo(0, 0);
    });

    it('inclui specialties como array', async () => {
      const { vet } = await seedVet(prisma, {
        email: 'spec@test.com',
        fullName: 'Dr. Especialista',
        lat: SP.lat,
        lng: SP.lng,
      });

      const specialty = await prisma.specialty.create({ data: { name: 'Dermatologia', slug: 'dermatologia' } });
      await prisma.$executeRaw`
        INSERT INTO veterinarian_specialties ("veterinarianId", "specialtyId")
        VALUES (${vet.id}::uuid, ${specialty.id}::uuid)
      `;

      const { rows } = await repo.search(baseParams);

      expect(Array.isArray(rows[0]!.specialties)).toBe(true);
      expect(rows[0]!.specialties).toHaveLength(1);
      expect(rows[0]!.specialties![0]!.name).toBe('Dermatologia');
    });

    it('ordena por distância crescente', async () => {
      // Pinheiros (~5 km de distância do centro)
      await seedVet(prisma, {
        email: 'pinheiros@test.com',
        fullName: 'Dr. Pinheiros',
        lat: -23.5648,
        lng: -46.6858,
      });
      await seedVet(prisma, {
        email: 'centro@test.com',
        fullName: 'Dr. Centro',
        lat: SP.lat,
        lng: SP.lng,
      });

      const { rows } = await repo.search(baseParams);

      expect(rows[0]!.distance_km).toBeLessThan(rows[1]!.distance_km);
    });
  });

  describe('filtros', () => {
    it('filtra por especialidade quando specialtyId fornecido', async () => {
      await seedVet(prisma, { email: 'sem@test.com', fullName: 'Dr. Sem Especialidade', lat: SP.lat, lng: SP.lng });
      const { vet } = await seedVet(prisma, {
        email: 'com@test.com',
        fullName: 'Dr. Com Especialidade',
        lat: SP.lat + 0.01,
        lng: SP.lng,
      });

      const specialty = await prisma.specialty.create({ data: { name: 'Cardiologia', slug: 'cardiologia' } });
      await prisma.$executeRaw`
        INSERT INTO veterinarian_specialties ("veterinarianId", "specialtyId")
        VALUES (${vet.id}::uuid, ${specialty.id}::uuid)
      `;

      const { rows } = await repo.search({ ...baseParams, specialtyId: specialty.id });

      expect(rows).toHaveLength(1);
      expect(rows[0]!.full_name).toBe('Dr. Com Especialidade');
    });

    it('exclui vet com verificationStatus != verified', async () => {
      await seedVet(prisma, {
        email: 'pending@test.com',
        fullName: 'Dr. Pendente',
        lat: SP.lat,
        lng: SP.lng,
        verificationStatus: 'pending',
      });

      const { rows } = await repo.search(baseParams);

      expect(rows).toHaveLength(0);
    });

    it('exclui vet com user.status != active', async () => {
      await seedVet(prisma, {
        email: 'suspended@test.com',
        fullName: 'Dr. Suspenso',
        lat: SP.lat,
        lng: SP.lng,
        status: 'suspended',
      });

      const { rows } = await repo.search(baseParams);

      expect(rows).toHaveLength(0);
    });
  });

  describe('paginação', () => {
    it('respeita limit e offset', async () => {
      for (let i = 0; i < 5; i++) {
        await seedVet(prisma, {
          email: `vet${i}@test.com`,
          fullName: `Dr. Vet ${i}`,
          lat: SP.lat + i * 0.001,
          lng: SP.lng,
        });
      }

      const page1 = await repo.search({ ...baseParams, limit: 2, page: 1 });
      const page2 = await repo.search({ ...baseParams, limit: 2, page: 2 });

      expect(page1.rows).toHaveLength(2);
      expect(page2.rows).toHaveLength(2);
      expect(page1.totalCount).toBe(5);
      expect(page1.rows[0]!.vet_id).not.toBe(page2.rows[0]!.vet_id);
    });
  });
});
