import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { createHash } from 'node:crypto';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';

import { PrismaModule } from '../../shared/prisma/prisma.module';
import { UsersRepository } from '../users/users.repository';
import { UsersModule } from '../users/users.module';
import { TokensRepository } from './tokens.repository';
import { AuthModule } from './auth.module';
import { setupTestDatabase, type TestDatabase } from '../../../test/helpers/database';

function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

describe('TokensRepository (integração)', () => {
  let db: TestDatabase;
  let tokensRepo: TokensRepository;
  let usersRepo: UsersRepository;
  let userId: string;

  beforeAll(async () => {
    db = await setupTestDatabase();
    process.env['DATABASE_URL'] = db.url;
    process.env['DIRECT_URL'] = db.url;
    process.env['JWT_ACCESS_SECRET'] = 'test-access-secret-at-least-32-chars!!';
    process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-min-32-chars!!!!';
    process.env['JWT_ACCESS_TTL'] = '15m';
    process.env['JWT_REFRESH_TTL'] = '30d';

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        UsersModule,
        AuthModule,
      ],
    }).compile();

    await moduleRef.init();
    tokensRepo = moduleRef.get(TokensRepository);
    usersRepo = moduleRef.get(UsersRepository);
  }, 120_000);

  afterAll(async () => {
    await db.teardown();
  });

  beforeEach(async () => {
    await db.clear();

    const user = await usersRepo.create({
      email: 'refresh@petnalia.test',
      passwordHash: '$argon2id$v=19$test',
      role: 'tutor',
      profile: { create: { fullName: 'Refresh Tester' } },
    });
    userId = user.id;
  });

  function futureDate(offsetMs = 30 * 24 * 60 * 60 * 1_000): Date {
    return new Date(Date.now() + offsetMs);
  }

  describe('create', () => {
    it('persiste refresh token no banco', async () => {
      const raw = 'raw-token-value';
      const token = await tokensRepo.create({
        userId,
        tokenHash: hashToken(raw),
        expiresAt: futureDate(),
      });

      expect(token.id).toBeDefined();
      expect(token.userId).toBe(userId);
      expect(token.revokedAt).toBeNull();
    });
  });

  describe('findByHash', () => {
    it('retorna token quando hash confere', async () => {
      const raw = 'find-me-by-hash';
      await tokensRepo.create({ userId, tokenHash: hashToken(raw), expiresAt: futureDate() });

      const found = await tokensRepo.findByHash(hashToken(raw));
      expect(found).not.toBeNull();
      expect(found?.userId).toBe(userId);
    });

    it('retorna null quando hash não existe', async () => {
      const found = await tokensRepo.findByHash(hashToken('nao-existe'));
      expect(found).toBeNull();
    });
  });

  describe('revoke', () => {
    it('define revokedAt no token', async () => {
      const token = await tokensRepo.create({
        userId,
        tokenHash: hashToken('revoke-me'),
        expiresAt: futureDate(),
      });

      const revoked = await tokensRepo.revoke(token.id);

      expect(revoked.revokedAt).toBeInstanceOf(Date);
    });
  });

  describe('revokeAllForUser', () => {
    it('revoga todos os tokens ativos do usuário', async () => {
      await tokensRepo.create({ userId, tokenHash: hashToken('tok-a'), expiresAt: futureDate() });
      await tokensRepo.create({ userId, tokenHash: hashToken('tok-b'), expiresAt: futureDate() });

      await tokensRepo.revokeAllForUser(userId);

      const tokenA = await tokensRepo.findByHash(hashToken('tok-a'));
      const tokenB = await tokensRepo.findByHash(hashToken('tok-b'));

      expect(tokenA?.revokedAt).toBeInstanceOf(Date);
      expect(tokenB?.revokedAt).toBeInstanceOf(Date);
    });

    it('não afeta tokens de outros usuários', async () => {
      const otherUser = await usersRepo.create({
        email: 'other@petnalia.test',
        passwordHash: '$argon2id$v=19$test',
        role: 'tutor',
        profile: { create: { fullName: 'Other User' } },
      });

      await tokensRepo.create({
        userId: otherUser.id,
        tokenHash: hashToken('other-tok'),
        expiresAt: futureDate(),
      });
      await tokensRepo.create({ userId, tokenHash: hashToken('my-tok'), expiresAt: futureDate() });

      await tokensRepo.revokeAllForUser(userId);

      const otherToken = await tokensRepo.findByHash(hashToken('other-tok'));
      expect(otherToken?.revokedAt).toBeNull();
    });
  });
});
