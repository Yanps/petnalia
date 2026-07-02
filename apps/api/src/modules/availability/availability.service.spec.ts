import { describe, it, expect, vi } from 'vitest';
import type { AvailabilitySlot } from '@prisma/client';
import type { AvailabilityQuery, CreateSlotsInput } from '@petnalia/types';

import type { RedisService } from '../../shared/redis/redis.service';
import { AvailabilityRepository } from './availability.repository';
import { AvailabilityService, SlotNotAvailableError } from './availability.service';

const SLOT_ID = 'slot-uuid-1';
const VET_ID = 'vet-uuid-1';

const baseSlot: AvailabilitySlot = {
  id: SLOT_ID,
  veterinarianId: VET_ID,
  startsAt: new Date('2026-02-01T09:00:00Z'),
  endsAt: new Date('2026-02-01T10:00:00Z'),
  status: 'open',
  recurrenceId: null,
  heldUntil: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

function makeRepo(overrides: Partial<AvailabilityRepository> = {}) {
  return {
    findOpenSlots: vi.fn().mockResolvedValue([baseSlot]),
    createSlots: vi.fn().mockResolvedValue(3),
    holdSlot: vi.fn().mockResolvedValue(baseSlot),
    releaseSlot: vi.fn().mockResolvedValue(undefined),
    bookSlot: vi.fn().mockResolvedValue(true),
    ...overrides,
  } as unknown as AvailabilityRepository;
}

function makeRedis(overrides: Partial<RedisService> = {}) {
  return {
    set: vi.fn().mockResolvedValue('OK'),
    get: vi.fn().mockResolvedValue(null),
    del: vi.fn().mockResolvedValue(1),
    ...overrides,
  } as unknown as RedisService;
}

function makeService(repo = makeRepo(), redis = makeRedis()) {
  return new AvailabilityService(repo, redis);
}

describe('AvailabilityService.getOpenSlots', () => {
  it('delega para o repositório e retorna os slots', async () => {
    const repo = makeRepo();
    const query: AvailabilityQuery = {
      veterinarianId: VET_ID,
      from: '2026-02-01T00:00:00Z',
      to: '2026-02-01T23:59:59Z',
    };
    const result = await makeService(repo).getOpenSlots(query);
    expect(repo.findOpenSlots).toHaveBeenCalledWith(query);
    expect(result).toEqual([baseSlot]);
  });
});

describe('AvailabilityService.createSlots', () => {
  it('delega para o repositório e retorna a contagem criada', async () => {
    const repo = makeRepo({ createSlots: vi.fn().mockResolvedValue(5) });
    const dto: CreateSlotsInput = {
      slots: [
        { startsAt: '2026-02-01T09:00:00Z', endsAt: '2026-02-01T10:00:00Z' },
      ],
    };
    const result = await makeService(repo).createSlots(VET_ID, dto);
    expect(repo.createSlots).toHaveBeenCalledWith(VET_ID, dto.slots);
    expect(result).toEqual({ created: 5 });
  });
});

describe('AvailabilityService.holdSlot', () => {
  it('lança SlotNotAvailableError quando slot não existe ou já está ocupado', async () => {
    const service = makeService(makeRepo({ holdSlot: vi.fn().mockResolvedValue(null) }));
    await expect(service.holdSlot(SLOT_ID)).rejects.toThrow(SlotNotAvailableError);
  });

  it('salva holdToken no Redis com TTL de 600s', async () => {
    const redis = makeRedis();
    await makeService(makeRepo(), redis).holdSlot(SLOT_ID);
    expect(redis.set).toHaveBeenCalledWith(
      `slot:hold:${SLOT_ID}`,
      expect.any(String), // UUID token
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

  it('expiresAt está ~10 minutos no futuro', async () => {
    const before = Date.now();
    const result = await makeService().holdSlot(SLOT_ID);
    const after = Date.now();
    const expiresAtMs = new Date(result.expiresAt).getTime();
    expect(expiresAtMs).toBeGreaterThanOrEqual(before + 600_000);
    expect(expiresAtMs).toBeLessThanOrEqual(after + 600_000 + 100);
  });
});

describe('AvailabilityService.verifyHoldToken', () => {
  it('retorna true quando o token coincide com o armazenado', async () => {
    const redis = makeRedis({ get: vi.fn().mockResolvedValue('token-abc') });
    const result = await makeService(makeRepo(), redis).verifyHoldToken(SLOT_ID, 'token-abc');
    expect(result).toBe(true);
  });

  it('retorna false quando o token é diferente', async () => {
    const redis = makeRedis({ get: vi.fn().mockResolvedValue('token-abc') });
    const result = await makeService(makeRepo(), redis).verifyHoldToken(SLOT_ID, 'outro-token');
    expect(result).toBe(false);
  });

  it('retorna false quando não há token no Redis (expirado)', async () => {
    const redis = makeRedis({ get: vi.fn().mockResolvedValue(null) });
    const result = await makeService(makeRepo(), redis).verifyHoldToken(SLOT_ID, 'qualquer');
    expect(result).toBe(false);
  });
});

describe('AvailabilityService.releaseHold', () => {
  it('remove a chave do Redis e libera o slot no repositório', async () => {
    const redis = makeRedis();
    const repo = makeRepo();
    await makeService(repo, redis).releaseHold(SLOT_ID);
    expect(redis.del).toHaveBeenCalledWith(`slot:hold:${SLOT_ID}`);
    expect(repo.releaseSlot).toHaveBeenCalledWith(SLOT_ID);
  });
});
