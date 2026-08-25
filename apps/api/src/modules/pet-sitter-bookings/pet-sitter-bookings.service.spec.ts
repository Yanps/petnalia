import { describe, expect, it, vi } from 'vitest';

import type { RedisService } from '../../shared/redis/redis.service';
import { PetSitterNotFoundError } from '../pet-sitters/pet-sitters.errors';
import type { PetSittersRepository } from '../pet-sitters/pet-sitters.repository';
import type { PetSitterAvailabilityService } from '../pet-sitter-availability/pet-sitter-availability.service';
import {
  InvalidPetSitterHoldTokenError,
  PetSitterBookingAddressRequiredError,
  PetSitterBookingForbiddenError,
  PetSitterBookingNotFoundError,
  PetSitterBookingTransitionError,
} from './pet-sitter-bookings.errors';
import { PetSitterBookingsRepository } from './pet-sitter-bookings.repository';
import { PetSitterBookingsService } from './pet-sitter-bookings.service';

const TUTOR_ID = 'aaaaaaaa-0000-0000-0000-000000000000';
const SITTER_USER_ID = 'bbbbbbbb-0000-0000-0000-000000000000';
const SITTER_ID = 'ffffffff-0000-0000-0000-000000000000';
const SLOT_ID = 'cccccccc-0000-0000-0000-000000000000';
const BOOKING_ID = 'dddddddd-0000-0000-0000-000000000000';

const baseBooking = {
  id: BOOKING_ID,
  tutorId: TUTOR_ID,
  petSitterId: SITTER_ID,
  petId: 'pet-1',
  addressId: 'addr-1',
  slotId: SLOT_ID,
  service: 'passeio' as const,
  status: 'requested' as const,
  notes: null,
  createdAt: new Date('2026-01-01T10:00:00Z'),
  updatedAt: new Date('2026-01-01T10:00:00Z'),
  deletedAt: null,
  slot: { startsAt: new Date('2026-01-05T09:00:00Z'), endsAt: new Date('2026-01-05T10:00:00Z') },
};

function makeRepo(overrides: Partial<PetSitterBookingsRepository> = {}) {
  return {
    findById: vi.fn().mockResolvedValue(baseBooking),
    findByTutor: vi.fn().mockResolvedValue([baseBooking]),
    findBySitter: vi.fn().mockResolvedValue([baseBooking]),
    findParticipants: vi.fn().mockResolvedValue(null),
    book: vi.fn().mockResolvedValue(baseBooking),
    updateStatus: vi.fn().mockImplementation((id, status) =>
      Promise.resolve({ ...baseBooking, status }),
    ),
    getPrisma: vi.fn().mockReturnValue({
      $transaction: vi.fn().mockImplementation((cb: (tx: unknown) => Promise<unknown>) => cb({})),
    }),
    ...overrides,
  } as unknown as PetSitterBookingsRepository;
}

function makeAvailabilityService(overrides: Partial<PetSitterAvailabilityService> = {}) {
  return {
    verifyHoldToken: vi.fn().mockResolvedValue(true),
    releaseHold: vi.fn().mockResolvedValue(undefined),
    getRepository: vi.fn().mockReturnValue({
      bookSlot: vi.fn().mockResolvedValue(true),
      findSlotById: vi.fn().mockResolvedValue({ startsAt: new Date('2026-01-05T09:00:00Z') }),
    }),
    ...overrides,
  } as unknown as PetSitterAvailabilityService;
}

function makePetSittersRepo(overrides: Partial<PetSittersRepository> = {}) {
  return {
    findByUserId: vi.fn().mockResolvedValue({ id: SITTER_ID, userId: SITTER_USER_ID }),
    ...overrides,
  } as unknown as PetSittersRepository;
}

function makeRedis(overrides: Partial<RedisService> = {}) {
  return {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
    ...overrides,
  } as unknown as RedisService;
}

function makeNotifications() {
  return { enqueueEmail: vi.fn().mockResolvedValue(undefined) } as never;
}

function makeService(
  repo = makeRepo(),
  avail = makeAvailabilityService(),
  petSittersRepo = makePetSittersRepo(),
  redis = makeRedis(),
) {
  return new PetSitterBookingsService(repo, avail, petSittersRepo, redis, makeNotifications());
}

describe('PetSitterBookingsService', () => {
  describe('bookSitterService', () => {
    it('books when hold token is valid', async () => {
      const svc = makeService();
      const result = await svc.bookSitterService(TUTOR_ID, {
        petSitterId: SITTER_ID,
        petId: 'pet-1',
        addressId: 'addr-1',
        slotId: SLOT_ID,
        holdToken: 'valid-token',
        service: 'passeio',
      });
      expect(result.id).toBe(BOOKING_ID);
    });

    it('throws InvalidPetSitterHoldTokenError when token is wrong', async () => {
      const avail = makeAvailabilityService({ verifyHoldToken: vi.fn().mockResolvedValue(false) });
      const svc = makeService(makeRepo(), avail);
      await expect(
        svc.bookSitterService(TUTOR_ID, {
          petSitterId: SITTER_ID,
          petId: 'pet-1',
          addressId: 'addr-1',
          slotId: SLOT_ID,
          holdToken: 'wrong-token',
          service: 'passeio',
        }),
      ).rejects.toThrow(InvalidPetSitterHoldTokenError);
    });

    it('throws PetSitterBookingAddressRequiredError when a "passeio" is requested without an address', async () => {
      const svc = makeService();
      await expect(
        svc.bookSitterService(TUTOR_ID, {
          petSitterId: SITTER_ID,
          petId: 'pet-1',
          slotId: SLOT_ID,
          holdToken: 'valid-token',
          service: 'passeio',
        }),
      ).rejects.toThrow(PetSitterBookingAddressRequiredError);
    });

    it('does not require an address for "hospedagem"', async () => {
      const repo = makeRepo();
      const svc = makeService(repo);
      const result = await svc.bookSitterService(TUTOR_ID, {
        petSitterId: SITTER_ID,
        petId: 'pet-1',
        slotId: SLOT_ID,
        holdToken: 'valid-token',
        service: 'hospedagem',
      });
      expect(result.id).toBe(BOOKING_ID);
    });

    it('returns cached result when idempotency key already exists', async () => {
      const cached = JSON.stringify({ id: BOOKING_ID, status: 'requested' });
      const redis = makeRedis({ get: vi.fn().mockResolvedValue(cached) });
      const repo = makeRepo();
      const svc = makeService(repo, makeAvailabilityService(), makePetSittersRepo(), redis);

      const result = await svc.bookSitterService(
        TUTOR_ID,
        {
          petSitterId: SITTER_ID,
          petId: 'pet-1',
          addressId: 'addr-1',
          slotId: SLOT_ID,
          holdToken: 't',
          service: 'passeio',
        },
        'idem-key-123',
      );
      expect(result.id).toBe(BOOKING_ID);
      expect(repo.book).not.toHaveBeenCalled();
    });
  });

  describe('getBooking', () => {
    it('returns booking for tutor', async () => {
      const result = await makeService().getBooking(BOOKING_ID, TUTOR_ID);
      expect(result.id).toBe(BOOKING_ID);
    });

    it('returns booking for the owning sitter', async () => {
      const result = await makeService().getBooking(BOOKING_ID, SITTER_USER_ID);
      expect(result.id).toBe(BOOKING_ID);
    });

    it('throws NotFound when booking does not exist', async () => {
      const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) });
      await expect(makeService(repo).getBooking('missing', TUTOR_ID)).rejects.toThrow(
        PetSitterBookingNotFoundError,
      );
    });

    it('throws Forbidden when caller is a stranger', async () => {
      const petSittersRepo = makePetSittersRepo({ findByUserId: vi.fn().mockResolvedValue(null) });
      await expect(
        makeService(makeRepo(), makeAvailabilityService(), petSittersRepo).getBooking(BOOKING_ID, 'stranger'),
      ).rejects.toThrow(PetSitterBookingForbiddenError);
    });
  });

  describe('confirmBooking', () => {
    it('confirms when the sitter owns the booking and status is requested', async () => {
      const result = await makeService().confirmBooking(BOOKING_ID, SITTER_USER_ID);
      expect(result.status).toBe('confirmed');
    });

    it('throws Forbidden when caller is not the owning sitter', async () => {
      const petSittersRepo = makePetSittersRepo({
        findByUserId: vi.fn().mockResolvedValue({ id: 'other-sitter', userId: 'other-user' }),
      });
      await expect(
        makeService(makeRepo(), makeAvailabilityService(), petSittersRepo).confirmBooking(
          BOOKING_ID,
          'other-user',
        ),
      ).rejects.toThrow(PetSitterBookingForbiddenError);
    });

    it('throws PetSitterNotFoundError when caller has no sitter profile', async () => {
      const petSittersRepo = makePetSittersRepo({ findByUserId: vi.fn().mockResolvedValue(null) });
      await expect(
        makeService(makeRepo(), makeAvailabilityService(), petSittersRepo).confirmBooking(BOOKING_ID, TUTOR_ID),
      ).rejects.toThrow(PetSitterNotFoundError);
    });

    it('throws TransitionError when status is not requested', async () => {
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue({ ...baseBooking, status: 'cancelled' }),
      });
      await expect(makeService(repo).confirmBooking(BOOKING_ID, SITTER_USER_ID)).rejects.toThrow(
        PetSitterBookingTransitionError,
      );
    });
  });

  describe('cancelBooking', () => {
    it('allows tutor to cancel', async () => {
      const result = await makeService().cancelBooking(BOOKING_ID, TUTOR_ID);
      expect(result.status).toBe('cancelled');
    });

    it('allows the owning sitter to cancel', async () => {
      const result = await makeService().cancelBooking(BOOKING_ID, SITTER_USER_ID);
      expect(result.status).toBe('cancelled');
    });

    it('throws Forbidden for strangers', async () => {
      const petSittersRepo = makePetSittersRepo({ findByUserId: vi.fn().mockResolvedValue(null) });
      await expect(
        makeService(makeRepo(), makeAvailabilityService(), petSittersRepo).cancelBooking(
          BOOKING_ID,
          'stranger',
        ),
      ).rejects.toThrow(PetSitterBookingForbiddenError);
    });

    it('throws TransitionError when already cancelled', async () => {
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue({ ...baseBooking, status: 'cancelled' }),
      });
      await expect(makeService(repo).cancelBooking(BOOKING_ID, TUTOR_ID)).rejects.toThrow(
        PetSitterBookingTransitionError,
      );
    });
  });

  describe('completeBooking', () => {
    it('completes when the sitter owns the booking and status is confirmed', async () => {
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue({ ...baseBooking, status: 'confirmed' }),
      });
      const result = await makeService(repo).completeBooking(BOOKING_ID, SITTER_USER_ID);
      expect(result.status).toBe('completed');
    });

    it('throws TransitionError when status is not confirmed', async () => {
      await expect(makeService().completeBooking(BOOKING_ID, SITTER_USER_ID)).rejects.toThrow(
        PetSitterBookingTransitionError,
      );
    });
  });

  describe('listMyBookings', () => {
    it('lists by tutor', async () => {
      const repo = makeRepo();
      const result = await makeService(repo).listMyBookings(TUTOR_ID, 'tutor');
      expect(repo.findByTutor).toHaveBeenCalledWith(TUTOR_ID);
      expect(result).toHaveLength(1);
    });

    it('lists by pet sitter, resolving the sitter id from the userId first', async () => {
      const repo = makeRepo();
      const petSittersRepo = makePetSittersRepo();
      const result = await makeService(repo, makeAvailabilityService(), petSittersRepo).listMyBookings(
        SITTER_USER_ID,
        'pet_sitter',
      );
      expect(petSittersRepo.findByUserId).toHaveBeenCalledWith(SITTER_USER_ID);
      expect(repo.findBySitter).toHaveBeenCalledWith(SITTER_ID);
      expect(result).toHaveLength(1);
    });
  });
});
