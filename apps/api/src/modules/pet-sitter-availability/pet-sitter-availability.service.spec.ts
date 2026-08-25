import { describe, it, expect, vi } from 'vitest';
import type { PetSitterAvailabilitySlot } from '@prisma/client';
import type { CreatePetSitterSlotsInput, PetSitterAvailabilityQuery } from '@petnalia/types';

import type { RedisService } from '../../shared/redis/redis.service';
import { PetSitterNotFoundError } from '../pet-sitters/pet-sitters.errors';
import type { PetSittersRepository } from '../pet-sitters/pet-sitters.repository';
import { PetSitterAvailabilityRepository } from './pet-sitter-availability.repository';
import { PetSitterAvailabilityService, PetSitterSlotNotAvailableError } from './pet-sitter-availability.service';

const SLOT_ID = 'slot-uuid-1';
const SITTER_ID = 'sitter-uuid-1';
const USER_ID = 'user-uuid-1';

const baseSlot: PetSitterAvailabilitySlot = {
  id: SLOT_ID,
  petSitterId: SITTER_ID,
  startsAt: new Date('2026-02-01T09:00:00Z'),
  endsAt: new Date('2026-02-01T10:00:00Z'),
  status: 'open',
  heldUntil: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

function makeRepo(overrides: Partial<PetSitterAvailabilityRepository> = {}) {
  return {
    findOpenSlots: vi.fn().mockResolvedValue([baseSlot]),
    createSlots: vi.fn().mockResolvedValue(3),
    holdSlot: vi.fn().mockResolvedValue(baseSlot),
    releaseSlot: vi.fn().mockResolvedValue(undefined),
    bookSlot: vi.fn().mockResolvedValue(true),
    ...overrides,
  } as unknown as PetSitterAvailabilityRepository;
}

function makePetSittersRepo(overrides: Partial<PetSittersRepository> = {}) {
  return {
    findByUserId: vi.fn().mockResolvedValue({ id: SITTER_ID, userId: USER_ID }),
    ...overrides,
  } as unknown as PetSittersRepository;
}

function makeRedis(overrides: Partial<RedisService> = {}) {
  return {
    set: vi.fn().mockResolvedValue('OK'),
    get: vi.fn().mockResolvedValue(null),
    del: vi.fn().mockResolvedValue(1),
    ...overrides,
  } as unknown as RedisService;
}

function makeService(
  repo = makeRepo(),
  petSittersRepo = makePetSittersRepo(),
  redis = makeRedis(),
) {
  return new PetSitterAvailabilityService(repo, petSittersRepo, redis);
}

describe('PetSitterAvailabilityService.getOpenSlots', () => {
  it('delega para o repositório e retorna os slots', async () => {
    const repo = makeRepo();
    const query: PetSitterAvailabilityQuery = {
      petSitterId: SITTER_ID,
      from: '2026-02-01T00:00:00Z',
      to: '2026-02-01T23:59:59Z',
    };
    const result = await makeService(repo).getOpenSlots(query);
    expect(repo.findOpenSlots).toHaveBeenCalledWith(query);
    expect(result).toEqual([baseSlot]);
  });
});

describe('PetSitterAvailabilityService.createSlotsForUser', () => {
  it('resolve o pet sitter pelo userId e cria os slots com o petSitterId', async () => {
    const repo = makeRepo({ createSlots: vi.fn().mockResolvedValue(5) });
    const petSittersRepo = makePetSittersRepo();
    const dto: CreatePetSitterSlotsInput = {
      slots: [{ startsAt: '2026-02-01T09:00:00Z', endsAt: '2026-02-01T10:00:00Z' }],
    };
    const result = await makeService(repo, petSittersRepo).createSlotsForUser(USER_ID, dto);
    expect(petSittersRepo.findByUserId).toHaveBeenCalledWith(USER_ID);
    expect(repo.createSlots).toHaveBeenCalledWith(SITTER_ID, dto.slots);
    expect(result).toEqual({ created: 5 });
  });

  it('lança PetSitterNotFoundError quando o usuário não tem perfil de pet sitter', async () => {
    const petSittersRepo = makePetSittersRepo({ findByUserId: vi.fn().mockResolvedValue(null) });
    const dto: CreatePetSitterSlotsInput = {
      slots: [{ startsAt: '2026-02-01T09:00:00Z', endsAt: '2026-02-01T10:00:00Z' }],
    };
    await expect(makeService(makeRepo(), petSittersRepo).createSlotsForUser(USER_ID, dto)).rejects.toThrow(
      PetSitterNotFoundError,
    );
  });
});

describe('PetSitterAvailabilityService.holdSlot', () => {
  it('lança PetSitterSlotNotAvailableError quando o slot não existe ou já está ocupado', async () => {
    const service = makeService(makeRepo({ holdSlot: vi.fn().mockResolvedValue(null) }));
    await expect(service.holdSlot(SLOT_ID)).rejects.toThrow(PetSitterSlotNotAvailableError);
  });

  it('salva holdToken no Redis com TTL de 600s', async () => {
    const redis = makeRedis();
    await makeService(makeRepo(), makePetSittersRepo(), redis).holdSlot(SLOT_ID);
    expect(redis.set).toHaveBeenCalledWith(
      `pet-sitter-slot:hold:${SLOT_ID}`,
      expect.any(String),
      'EX',
      600,
    );
  });

  it('retorna holdToken e expiresAt', async () => {
    const result = await makeService().holdSlot(SLOT_ID);
    expect(result.holdToken).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    expect(new Date(result.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });
});

describe('PetSitterAvailabilityService.verifyHoldToken', () => {
  it('retorna true quando o token coincide com o armazenado', async () => {
    const redis = makeRedis({ get: vi.fn().mockResolvedValue('token-abc') });
    const result = await makeService(makeRepo(), makePetSittersRepo(), redis).verifyHoldToken(SLOT_ID, 'token-abc');
    expect(result).toBe(true);
  });

  it('retorna false quando o token é diferente', async () => {
    const redis = makeRedis({ get: vi.fn().mockResolvedValue('token-abc') });
    const result = await makeService(makeRepo(), makePetSittersRepo(), redis).verifyHoldToken(SLOT_ID, 'outro');
    expect(result).toBe(false);
  });
});

describe('PetSitterAvailabilityService.releaseHold', () => {
  it('remove a chave do Redis e libera o slot no repositório', async () => {
    const redis = makeRedis();
    const repo = makeRepo();
    await makeService(repo, makePetSittersRepo(), redis).releaseHold(SLOT_ID);
    expect(redis.del).toHaveBeenCalledWith(`pet-sitter-slot:hold:${SLOT_ID}`);
    expect(repo.releaseSlot).toHaveBeenCalledWith(SLOT_ID);
  });
});
