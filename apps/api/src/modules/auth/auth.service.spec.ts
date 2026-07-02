import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import type { User } from '@prisma/client';

import { AuthService } from './auth.service';
import { UsersRepository } from '../users/users.repository';
import { TokensRepository } from './tokens.repository';
import {
  EmailTakenError,
  InvalidCredentialsError,
  AccountSuspendedError,
  TokenExpiredError,
  TokenRevokedError,
} from './auth.errors';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('argon2', () => ({
  hash: vi.fn().mockResolvedValue('$argon2id$hashed'),
  verify: vi.fn().mockResolvedValue(true),
}));

const mockJwtService = { sign: vi.fn().mockReturnValue('access.token.jwt') };

const mockConfig = {
  get: vi.fn((key: string, def?: string) => {
    const map: Record<string, string> = {
      JWT_ACCESS_TTL: '15m',
      JWT_REFRESH_TTL: '30d',
    };
    return map[key] ?? def;
  }),
  getOrThrow: vi.fn().mockReturnValue('secret'),
};

const baseUser: User = {
  id: 'user-uuid-1',
  email: 'ana@petnalia.com',
  passwordHash: '$argon2id$hashed',
  role: 'tutor',
  status: 'active',
  emailVerifiedAt: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
};

function makeUsersRepo(overrides: Partial<Record<keyof UsersRepository, unknown>> = {}): UsersRepository {
  return {
    findByEmail: vi.fn().mockResolvedValue(null),
    findById: vi.fn().mockResolvedValue(baseUser),
    create: vi.fn().mockResolvedValue(baseUser),
    createVet: vi.fn().mockResolvedValue(baseUser),
    update: vi.fn(),
    softDelete: vi.fn(),
    ...overrides,
  } as unknown as UsersRepository;
}

function makeTokensRepo(overrides: Partial<Record<keyof TokensRepository, unknown>> = {}): TokensRepository {
  return {
    create: vi.fn().mockResolvedValue({ id: 'token-1' }),
    findByHash: vi.fn().mockResolvedValue(null),
    revoke: vi.fn().mockResolvedValue({}),
    revokeAllForUser: vi.fn().mockResolvedValue({}),
    ...overrides,
  } as unknown as TokensRepository;
}

const mockNotifications = { enqueueEmail: vi.fn().mockResolvedValue(undefined) };

function makeService(usersRepo: UsersRepository, tokensRepo: TokensRepository): AuthService {
  return new AuthService(
    mockJwtService as never,
    mockConfig as never,
    usersRepo,
    tokensRepo,
    mockNotifications as never,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AuthService.register', () => {
  it('deve criar usuário e retornar tokens quando e-mail não existe', async () => {
    const usersRepo = makeUsersRepo({ findByEmail: vi.fn().mockResolvedValue(null) });
    const tokensRepo = makeTokensRepo();
    const service = makeService(usersRepo, tokensRepo);

    const result = await service.register({
      email: 'novo@petnalia.com',
      password: 'senha12345',
      fullName: 'Novo Usuário',
      role: 'tutor',
    });

    expect(result.tokens.accessToken).toBe('access.token.jwt');
    expect(result.rawRefreshToken).toBeTypeOf('string');
    expect(result.rawRefreshToken.length).toBeGreaterThan(20);
    expect(usersRepo.create).toHaveBeenCalledOnce();
    expect(tokensRepo.create).toHaveBeenCalledOnce();
  });

  it('deve lançar EmailTakenError quando e-mail já existe', async () => {
    const usersRepo = makeUsersRepo({ findByEmail: vi.fn().mockResolvedValue(baseUser) });
    const service = makeService(usersRepo, makeTokensRepo());

    await expect(
      service.register({ email: 'ana@petnalia.com', password: 'senha12345', fullName: 'Ana', role: 'tutor' }),
    ).rejects.toBeInstanceOf(EmailTakenError);
  });
});

describe('AuthService.login', () => {
  it('deve retornar tokens para credenciais válidas', async () => {
    const usersRepo = makeUsersRepo({ findByEmail: vi.fn().mockResolvedValue(baseUser) });
    const service = makeService(usersRepo, makeTokensRepo());

    const result = await service.login({ email: 'ana@petnalia.com', password: 'senha12345' });

    expect(result.tokens.accessToken).toBe('access.token.jwt');
    expect(result.tokens.expiresIn).toBe(900); // 15m em segundos
  });

  it('deve lançar InvalidCredentialsError quando usuário não existe', async () => {
    const usersRepo = makeUsersRepo({ findByEmail: vi.fn().mockResolvedValue(null) });
    const service = makeService(usersRepo, makeTokensRepo());

    await expect(
      service.login({ email: 'naoexiste@petnalia.com', password: 'senha12345' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('deve lançar InvalidCredentialsError quando senha está errada', async () => {
    const { verify } = await import('argon2');
    (verify as Mock).mockResolvedValueOnce(false);

    const usersRepo = makeUsersRepo({ findByEmail: vi.fn().mockResolvedValue(baseUser) });
    const service = makeService(usersRepo, makeTokensRepo());

    await expect(
      service.login({ email: 'ana@petnalia.com', password: 'senha-errada' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('deve lançar AccountSuspendedError para conta suspensa', async () => {
    const suspended = { ...baseUser, status: 'suspended' as const };
    const usersRepo = makeUsersRepo({ findByEmail: vi.fn().mockResolvedValue(suspended) });
    const service = makeService(usersRepo, makeTokensRepo());

    await expect(
      service.login({ email: 'ana@petnalia.com', password: 'senha12345' }),
    ).rejects.toBeInstanceOf(AccountSuspendedError);
  });
});

describe('AuthService.refresh', () => {
  const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1_000);

  it('deve rotacionar token e emitir novo access token', async () => {
    const storedToken = { id: 'token-1', userId: baseUser.id, revokedAt: null, expiresAt: futureDate };
    const tokensRepo = makeTokensRepo({ findByHash: vi.fn().mockResolvedValue(storedToken) });
    const usersRepo = makeUsersRepo({ findById: vi.fn().mockResolvedValue(baseUser) });
    const service = makeService(usersRepo, tokensRepo);

    const result = await service.refresh('raw-refresh-token');

    expect(result.tokens.accessToken).toBe('access.token.jwt');
    expect(tokensRepo.revoke).toHaveBeenCalledWith('token-1');
    expect(tokensRepo.create).toHaveBeenCalledOnce();
  });

  it('deve lançar TokenRevokedError quando token não existe', async () => {
    const tokensRepo = makeTokensRepo({ findByHash: vi.fn().mockResolvedValue(null) });
    const service = makeService(makeUsersRepo(), tokensRepo);

    await expect(service.refresh('token-invalido')).rejects.toBeInstanceOf(TokenRevokedError);
  });

  it('deve lançar TokenRevokedError quando token já foi revogado', async () => {
    const revoked = { id: 'token-1', userId: baseUser.id, revokedAt: new Date(), expiresAt: futureDate };
    const tokensRepo = makeTokensRepo({ findByHash: vi.fn().mockResolvedValue(revoked) });
    const service = makeService(makeUsersRepo(), tokensRepo);

    await expect(service.refresh('raw-token')).rejects.toBeInstanceOf(TokenRevokedError);
  });

  it('deve lançar TokenExpiredError quando token expirou', async () => {
    const expired = { id: 'token-1', userId: baseUser.id, revokedAt: null, expiresAt: new Date('2020-01-01') };
    const tokensRepo = makeTokensRepo({ findByHash: vi.fn().mockResolvedValue(expired) });
    const service = makeService(makeUsersRepo(), tokensRepo);

    await expect(service.refresh('raw-token')).rejects.toBeInstanceOf(TokenExpiredError);
  });
});

describe('AuthService.logout', () => {
  it('deve revogar o refresh token quando ele existe', async () => {
    const stored = { id: 'token-1', userId: baseUser.id, revokedAt: null, expiresAt: new Date() };
    const tokensRepo = makeTokensRepo({ findByHash: vi.fn().mockResolvedValue(stored) });
    const service = makeService(makeUsersRepo(), tokensRepo);

    await service.logout('raw-token');

    expect(tokensRepo.revoke).toHaveBeenCalledWith('token-1');
  });

  it('deve ser idempotente quando token não existe', async () => {
    const tokensRepo = makeTokensRepo({ findByHash: vi.fn().mockResolvedValue(null) });
    const service = makeService(makeUsersRepo(), tokensRepo);

    await expect(service.logout('token-inexistente')).resolves.toBeUndefined();
    expect(tokensRepo.revoke).not.toHaveBeenCalled();
  });
});
