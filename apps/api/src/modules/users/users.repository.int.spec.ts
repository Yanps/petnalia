import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';

import { PrismaModule } from '../../shared/prisma/prisma.module';
import { UsersRepository } from './users.repository';
import { UsersModule } from './users.module';
import { setupTestDatabase, type TestDatabase } from '../../../test/helpers/database';

describe('UsersRepository (integração)', () => {
  let db: TestDatabase;
  let repo: UsersRepository;

  beforeAll(async () => {
    db = await setupTestDatabase();
    process.env['DATABASE_URL'] = db.url;
    process.env['DIRECT_URL'] = db.url;

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        UsersModule,
      ],
    }).compile();

    await moduleRef.init();
    repo = moduleRef.get(UsersRepository);
  }, 120_000);

  afterAll(async () => {
    await db.teardown();
  });

  beforeEach(async () => {
    await db.clear();
  });

  const seed = {
    email: 'ana@petnalia.test',
    passwordHash: '$argon2id$v=19$test',
    role: 'tutor' as const,
    profile: { create: { fullName: 'Ana Silva' } },
  };

  describe('create', () => {
    it('persiste usuário com perfil no banco', async () => {
      const user = await repo.create(seed);

      expect(user.id).toBeDefined();
      expect(user.email).toBe('ana@petnalia.test');
      expect(user.status).toBe('active');
      expect(user.profile?.fullName).toBe('Ana Silva');
    });

    it('lança erro de unique constraint para e-mail duplicado', async () => {
      await repo.create(seed);
      await expect(repo.create(seed)).rejects.toThrow();
    });
  });

  describe('findByEmail', () => {
    it('retorna usuário com perfil quando e-mail existe', async () => {
      await repo.create(seed);
      const found = await repo.findByEmail('ana@petnalia.test');

      expect(found).not.toBeNull();
      expect(found?.profile?.fullName).toBe('Ana Silva');
    });

    it('retorna null quando e-mail não existe', async () => {
      const found = await repo.findByEmail('naoexiste@petnalia.test');
      expect(found).toBeNull();
    });
  });

  describe('findById', () => {
    it('retorna usuário com perfil quando ID existe', async () => {
      const created = await repo.create(seed);
      const found = await repo.findById(created.id);

      expect(found?.id).toBe(created.id);
      expect(found?.profile?.fullName).toBe('Ana Silva');
    });

    it('retorna null para ID inexistente', async () => {
      const found = await repo.findById('00000000-0000-0000-0000-000000000000');
      expect(found).toBeNull();
    });
  });

  describe('softDelete', () => {
    it('marca status como deleted e registra deletedAt', async () => {
      const user = await repo.create(seed);
      const deleted = await repo.softDelete(user.id);

      expect(deleted.status).toBe('deleted');
      expect(deleted.deletedAt).toBeInstanceOf(Date);
    });

    it('não apaga o registro do banco (soft delete)', async () => {
      const user = await repo.create(seed);
      await repo.softDelete(user.id);

      const found = await repo.findById(user.id);
      expect(found).not.toBeNull();
      expect(found?.status).toBe('deleted');
    });
  });
});
