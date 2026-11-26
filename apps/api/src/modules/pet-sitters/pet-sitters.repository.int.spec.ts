import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';

import { PetSittersRepository } from './pet-sitters.repository';
import { setupTestDatabase, type TestDatabase } from '../../../test/helpers/database';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { PrismaService } from '../../shared/prisma/prisma.service';


// São Paulo city centre
const SP = { lat: -23.5505, lng: -46.6333 };
// Curitiba (~350 km away)
const CWB = { lat: -25.4284, lng: -49.2733 };

interface SeedPetSitterOpts {
  fullName: string;
  lat: number;
  lng: number;
  bio?: string;
  services?: string[];
}

async function seedPetSitter(prisma: PrismaService, opts: SeedPetSitterOpts) {
  const user = await prisma.user.create({
    data: {
      email: `${crypto.randomUUID()}@petnalia-test.com`,
      passwordHash: '$argon2id$v=19$test',
      role: 'pet_sitter',
      profile: { create: { fullName: opts.fullName } },
    },
  });

  const sitter = await prisma.petSitter.create({
    data: {
      userId: user.id,
      fullName: opts.fullName,
      bio: opts.bio ?? null,
      services: opts.services ?? ['passeio'],
      baseCity: 'São Paulo',
      baseState: 'SP',
    },
  });

  await prisma.$executeRaw`
    UPDATE pet_sitters
    SET geog = ST_SetSRID(ST_MakePoint(${opts.lng}::float8, ${opts.lat}::float8), 4326)::geography
    WHERE id = ${sitter.id}::uuid
  `;

  return sitter;
}

describe('PetSittersRepository.search (integração)', () => {
  let db: TestDatabase;
  let repo: PetSittersRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    db = await setupTestDatabase();
    process.env['DATABASE_URL'] = db.url;
    process.env['DIRECT_URL'] = db.url;
    process.env['JWT_ACCESS_SECRET'] = 'test-access-secret-at-least-32-chars!!';
    process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-min-32-chars!!!!';

    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
      providers: [PetSittersRepository],
    }).compile();

    await moduleRef.init();
    repo = moduleRef.get(PetSittersRepository);
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
    page: 1,
    limit: 12,
  };

  describe('busca geográfica básica', () => {
    it('retorna pet sitter dentro do raio', async () => {
      await seedPetSitter(prisma, { fullName: 'Ana Passeadora', lat: SP.lat, lng: SP.lng });

      const { rows, totalCount } = await repo.search(baseParams);

      expect(rows).toHaveLength(1);
      expect(totalCount).toBe(1);
      expect(rows[0]!.full_name).toBe('Ana Passeadora');
    });

    it('exclui pet sitter fora do raio', async () => {
      await seedPetSitter(prisma, { fullName: 'Longe Demais', lat: CWB.lat, lng: CWB.lng });

      const { rows } = await repo.search(baseParams);

      expect(rows).toHaveLength(0);
    });

    it('retorna lista vazia quando não há pet sitters no banco', async () => {
      const { rows, totalCount } = await repo.search(baseParams);

      expect(rows).toHaveLength(0);
      expect(totalCount).toBe(0);
    });

    it('ordena por distância crescente', async () => {
      await seedPetSitter(prisma, { fullName: 'Mais Longe', lat: -23.5648, lng: -46.6858 });
      await seedPetSitter(prisma, { fullName: 'Mais Perto', lat: SP.lat, lng: SP.lng });

      const { rows } = await repo.search(baseParams);

      expect(rows[0]!.full_name).toBe('Mais Perto');
      expect(rows[0]!.distance_km).toBeLessThan(rows[1]!.distance_km);
    });
  });

  describe('filtros', () => {
    it('filtra por serviço (overlap de array)', async () => {
      await seedPetSitter(prisma, { fullName: 'Só Passeio', lat: SP.lat, lng: SP.lng, services: ['passeio'] });
      await seedPetSitter(prisma, { fullName: 'Só Hospedagem', lat: SP.lat, lng: SP.lng, services: ['hospedagem'] });

      const { rows } = await repo.search({ ...baseParams, services: ['hospedagem'] });

      expect(rows).toHaveLength(1);
      expect(rows[0]!.full_name).toBe('Só Hospedagem');
    });

    it('filtra por múltiplos serviços (OR entre eles)', async () => {
      await seedPetSitter(prisma, { fullName: 'Passeio', lat: SP.lat, lng: SP.lng, services: ['passeio'] });
      await seedPetSitter(prisma, { fullName: 'Hospedagem', lat: SP.lat, lng: SP.lng, services: ['hospedagem'] });
      await seedPetSitter(prisma, { fullName: 'Day Care', lat: SP.lat, lng: SP.lng, services: ['day_care'] });

      const { rows } = await repo.search({ ...baseParams, services: ['passeio', 'hospedagem'] });

      expect(rows.map((r) => r.full_name).sort()).toEqual(['Hospedagem', 'Passeio']);
    });

    it('filtra por texto (q) no nome', async () => {
      await seedPetSitter(prisma, { fullName: 'Carla Mendonça', lat: SP.lat, lng: SP.lng });
      await seedPetSitter(prisma, { fullName: 'Roberto Lima', lat: SP.lat, lng: SP.lng });

      const { rows } = await repo.search({ ...baseParams, q: 'Mendonça' });

      expect(rows).toHaveLength(1);
      expect(rows[0]!.full_name).toBe('Carla Mendonça');
    });

    it('filtra por texto (q) na bio', async () => {
      await seedPetSitter(prisma, {
        fullName: 'Sem Match No Nome',
        lat: SP.lat,
        lng: SP.lng,
        bio: 'Especialista em day care com área externa',
      });
      await seedPetSitter(prisma, { fullName: 'Outro', lat: SP.lat, lng: SP.lng, bio: 'Só passeios' });

      const { rows } = await repo.search({ ...baseParams, q: 'área externa' });

      expect(rows).toHaveLength(1);
      expect(rows[0]!.full_name).toBe('Sem Match No Nome');
    });
  });

  describe('paginação', () => {
    it('respeita limit e offset', async () => {
      for (let i = 0; i < 5; i++) {
        await seedPetSitter(prisma, { fullName: `Sitter ${i}`, lat: SP.lat, lng: SP.lng });
      }

      const page1 = await repo.search({ ...baseParams, limit: 2, page: 1 });
      const page2 = await repo.search({ ...baseParams, limit: 2, page: 2 });

      expect(page1.rows).toHaveLength(2);
      expect(page2.rows).toHaveLength(2);
      expect(page1.totalCount).toBe(5);
      expect(page1.rows[0]!.id).not.toBe(page2.rows[0]!.id);
    });
  });
});
