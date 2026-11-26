import type { Profile, User } from '@prisma/client';
import { describe, it, expect, vi } from 'vitest';

import type { UpdateProfileInput } from '@petnalia/types';

import { UserNotFoundError } from './users.errors';
import type { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

const USER_ID = 'user-uuid-1';

const baseUser: User = {
  id: USER_ID,
  email: 'ana@petnalia.com',
  passwordHash: '$argon2id$hashed',
  role: 'tutor',
  status: 'active',
  emailVerifiedAt: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  deletedAt: null,
};

const baseProfile: Profile = {
  id: 'profile-uuid-1',
  userId: USER_ID,
  fullName: 'Ana Silva',
  phone: null,
  avatarUrl: null,
  cpf: null,
  locale: 'pt-BR',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

function makeRepo(overrides: Partial<Record<keyof UsersRepository, unknown>> = {}): UsersRepository {
  return {
    findById: vi.fn().mockResolvedValue({ ...baseUser, profile: baseProfile }),
    updateProfile: vi.fn().mockResolvedValue(baseProfile),
    softDelete: vi.fn().mockResolvedValue({ ...baseUser, status: 'deleted' }),
    ...overrides,
  } as unknown as UsersRepository;
}

describe('UsersService.getMe', () => {
  it('mapeia usuário e perfil para o formato de resposta', async () => {
    const repo = makeRepo();
    const result = await new UsersService(repo).getMe(USER_ID);

    expect(result).toEqual({
      id: USER_ID,
      email: 'ana@petnalia.com',
      role: 'tutor',
      status: 'active',
      fullName: 'Ana Silva',
      phone: null,
      avatarUrl: null,
      cpf: null,
      locale: 'pt-BR',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('lança UserNotFoundError quando usuário não existe', async () => {
    const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) });
    await expect(new UsersService(repo).getMe(USER_ID)).rejects.toThrow(UserNotFoundError);
  });

  it('lança UserNotFoundError quando perfil não existe', async () => {
    const repo = makeRepo({ findById: vi.fn().mockResolvedValue({ ...baseUser, profile: null }) });
    await expect(new UsersService(repo).getMe(USER_ID)).rejects.toThrow(UserNotFoundError);
  });
});

describe('UsersService.updateMe', () => {
  it('delega para o repositório com os campos informados', async () => {
    const repo = makeRepo();
    const dto: UpdateProfileInput = { fullName: 'Ana Souza' };
    await new UsersService(repo).updateMe(USER_ID, dto);

    expect(repo.updateProfile).toHaveBeenCalledWith(USER_ID, {
      fullName: 'Ana Souza',
    });
  });

  it('normaliza o CPF removendo formatação antes de persistir', async () => {
    const repo = makeRepo();
    await new UsersService(repo).updateMe(USER_ID, { cpf: '111.444.777-35' });

    expect(repo.updateProfile).toHaveBeenCalledWith(USER_ID, {
      cpf: '11144477735',
    });
  });
});

describe('UsersService.deleteMe', () => {
  it('delega para o repositório o soft delete', async () => {
    const repo = makeRepo();
    await new UsersService(repo).deleteMe(USER_ID);
    expect(repo.softDelete).toHaveBeenCalledWith(USER_ID);
  });
});
