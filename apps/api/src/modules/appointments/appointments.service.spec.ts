import { describe, expect, it, vi } from 'vitest';

import {
  AppointmentForbiddenError,
  AppointmentNotFoundError,
  AppointmentTransitionError,
  InvalidHoldTokenError,
} from './appointments.errors';
import type { AppointmentsRepository } from './appointments.repository';
import { AppointmentsService } from './appointments.service';
import type { RedisService } from '../../shared/redis/redis.service';
import { AddressNotFoundError, type AddressesService } from '../addresses/addresses.service';
import type { AvailabilityService } from '../availability/availability.service';
import { SlotNotFoundError } from '../availability/availability.service';
import { PetNotFoundError } from '../pets/pets.errors';
import type { PetsService } from '../pets/pets.service';
import { VeterinarianNotFoundError } from '../veterinarians/veterinarians.errors';
import type { VeterinariansRepository } from '../veterinarians/veterinarians.repository';


const TUTOR_ID = 'aaaaaaaa-0000-0000-0000-000000000000';
const OTHER_TUTOR_ID = 'aaaaaaaa-1111-0000-0000-000000000000';
// The vet's user id and the Veterinarian entity id are distinct on purpose:
// appointments reference veterinarians.id, while the JWT carries users.id.
const VET_USER_ID = 'bbbbbbbb-0000-0000-0000-000000000000';
const VET_ID = 'eeeeeeee-0000-0000-0000-000000000000';
const OTHER_VET_USER_ID = 'bbbbbbbb-1111-0000-0000-000000000000';
const OTHER_VET_ID = 'eeeeeeee-1111-0000-0000-000000000000';
const SLOT_ID = 'cccccccc-0000-0000-0000-000000000000';
const APPT_ID = 'dddddddd-0000-0000-0000-000000000000';

const bookInput = {
  veterinarianId: VET_ID,
  petId: 'pet-1',
  addressId: 'addr-1',
  slotId: SLOT_ID,
  holdToken: 'valid-token',
  modality: 'home' as const,
};

const baseAppointment = {
  id: APPT_ID,
  tutorId: TUTOR_ID,
  veterinarianId: VET_ID,
  petId: 'pet-1',
  addressId: 'addr-1',
  slotId: SLOT_ID,
  modality: 'home' as const,
  status: 'requested' as const,
  priceCents: 18000,
  notes: null,
  createdAt: new Date('2026-01-01T10:00:00Z'),
  updatedAt: new Date('2026-01-01T10:00:00Z'),
  deletedAt: null,
  slot: { startsAt: new Date('2026-01-05T09:00:00Z'), endsAt: new Date('2026-01-05T10:00:00Z') },
};

function makeRepo(overrides: Partial<AppointmentsRepository> = {}) {
  return {
    findById: vi.fn().mockResolvedValue(baseAppointment),
    findByTutor: vi.fn().mockResolvedValue([baseAppointment]),
    findByVet: vi.fn().mockResolvedValue([baseAppointment]),
    findParticipants: vi.fn().mockResolvedValue(null),
    book: vi.fn().mockResolvedValue(baseAppointment),
    updateStatus: vi.fn().mockImplementation((id, status) =>
      Promise.resolve({ ...baseAppointment, status }),
    ),
    getPrisma: vi.fn().mockReturnValue({
      $transaction: vi.fn().mockImplementation((cb: (tx: unknown) => Promise<unknown>) =>
        cb({}),
      ),
    }),
    ...overrides,
  } as unknown as AppointmentsRepository;
}

function makeAvailabilityService(overrides: Partial<AvailabilityService> = {}) {
  return {
    verifyHoldToken: vi.fn().mockResolvedValue(true),
    releaseHold: vi.fn().mockResolvedValue(undefined),
    getRepository: vi.fn().mockReturnValue({
      bookSlot: vi.fn().mockResolvedValue(true),
      findSlotById: vi.fn().mockResolvedValue({
        id: SLOT_ID,
        veterinarianId: VET_ID,
        startsAt: new Date('2026-01-05T09:00:00Z'),
      }),
    }),
    ...overrides,
  } as unknown as AvailabilityService;
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

interface VetPrices {
  homePriceCents: number | null;
  onlinePriceCents: number | null;
}

function makeVetsRepo(prices: VetPrices = { homePriceCents: 18000, onlinePriceCents: 9000 }) {
  const vetIdByUserId: Record<string, string> = {
    [VET_USER_ID]: VET_ID,
    [OTHER_VET_USER_ID]: OTHER_VET_ID,
  };
  return {
    findIdByUserId: vi.fn((userId: string) => Promise.resolve(vetIdByUserId[userId] ?? null)),
    findVetById: vi.fn((id: string) => Promise.resolve(id === VET_ID ? { id, ...prices } : null)),
  } as unknown as VeterinariansRepository;
}

function makePetsService(overrides: Partial<PetsService> = {}) {
  return {
    assertOwnedBy: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as PetsService;
}

function makeAddressesService(overrides: Partial<AddressesService> = {}) {
  return {
    assertOwnedBy: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as AddressesService;
}

function makeService(
  repo: AppointmentsRepository,
  avail: AvailabilityService,
  redis: RedisService,
  deps: { pets?: PetsService; addresses?: AddressesService; prices?: VetPrices } = {},
) {
  return new AppointmentsService(
    repo,
    avail,
    makeVetsRepo(deps.prices),
    deps.pets ?? makePetsService(),
    deps.addresses ?? makeAddressesService(),
    redis,
    makeNotifications(),
  );
}

describe('AppointmentsService', () => {
  describe('bookAppointment', () => {
    it('books when hold token is valid', async () => {
      const svc = makeService(makeRepo(), makeAvailabilityService(), makeRedis());
      const result = await svc.bookAppointment(TUTOR_ID, bookInput);
      expect(result.id).toBe(APPT_ID);
      expect(result.scheduledAt).toBe('2026-01-05T09:00:00.000Z');
    });

    it('throws InvalidHoldTokenError when token is wrong', async () => {
      const avail = makeAvailabilityService({ verifyHoldToken: vi.fn().mockResolvedValue(false) });
      const svc = makeService(makeRepo(), avail, makeRedis());
      await expect(
        svc.bookAppointment(TUTOR_ID, { ...bookInput, holdToken: 'wrong-token' }),
      ).rejects.toThrow(InvalidHoldTokenError);
    });

    it('rejects a pet that does not belong to the tutor', async () => {
      const repo = makeRepo();
      const pets = makePetsService({
        assertOwnedBy: vi.fn().mockRejectedValue(new PetNotFoundError()),
      });
      const svc = makeService(repo, makeAvailabilityService(), makeRedis(), { pets });

      await expect(svc.bookAppointment(TUTOR_ID, bookInput)).rejects.toThrow(PetNotFoundError);
      expect(repo.book).not.toHaveBeenCalled();
    });

    it('rejects an address that does not belong to the tutor', async () => {
      const repo = makeRepo();
      const addresses = makeAddressesService({
        assertOwnedBy: vi.fn().mockRejectedValue(new AddressNotFoundError()),
      });
      const svc = makeService(repo, makeAvailabilityService(), makeRedis(), { addresses });

      await expect(svc.bookAppointment(TUTOR_ID, bookInput)).rejects.toThrow(AddressNotFoundError);
      expect(repo.book).not.toHaveBeenCalled();
    });

    it("records the vet's in-person price for a home appointment", async () => {
      const repo = makeRepo();
      const svc = makeService(repo, makeAvailabilityService(), makeRedis());

      await svc.bookAppointment(TUTOR_ID, bookInput);

      expect(repo.book).toHaveBeenCalledWith(expect.objectContaining({ priceCents: 18000 }), {});
    });

    it("records the vet's teleconsultation price for an online appointment", async () => {
      const repo = makeRepo();
      const svc = makeService(repo, makeAvailabilityService(), makeRedis());

      await svc.bookAppointment(TUTOR_ID, { ...bookInput, modality: 'online' });

      expect(repo.book).toHaveBeenCalledWith(expect.objectContaining({ priceCents: 9000 }), {});
    });

    it('records null ("a combinar") when the vet has no price for the modality', async () => {
      const repo = makeRepo();
      const svc = makeService(repo, makeAvailabilityService(), makeRedis(), {
        prices: { homePriceCents: null, onlinePriceCents: 9000 },
      });

      await svc.bookAppointment(TUTOR_ID, bookInput);

      expect(repo.book).toHaveBeenCalledWith(expect.objectContaining({ priceCents: null }), {});
    });

    it('rejects a slot that belongs to a different veterinarian', async () => {
      const repo = makeRepo();
      const avail = makeAvailabilityService({
        getRepository: vi.fn().mockReturnValue({
          bookSlot: vi.fn().mockResolvedValue(true),
          findSlotById: vi.fn().mockResolvedValue({
            id: SLOT_ID,
            veterinarianId: OTHER_VET_ID,
            startsAt: new Date('2026-01-05T09:00:00Z'),
          }),
        }),
      });
      const svc = makeService(repo, avail, makeRedis());

      await expect(svc.bookAppointment(TUTOR_ID, bookInput)).rejects.toThrow(SlotNotFoundError);
      expect(repo.book).not.toHaveBeenCalled();
    });

    it('returns cached result when idempotency key already exists', async () => {
      const cached = JSON.stringify({ id: APPT_ID, status: 'requested' });
      const redis = makeRedis({ get: vi.fn().mockResolvedValue(cached) });
      const repo = makeRepo();
      const svc = makeService(repo, makeAvailabilityService(), redis);

      const result = await svc.bookAppointment(
        TUTOR_ID,
        bookInput,
        'idem-key-123',
      );
      expect(result.id).toBe(APPT_ID);
      expect(repo.book).not.toHaveBeenCalled();
    });

    it('scopes the idempotency key to the tutor, so another tutor never gets a cached booking', async () => {
      const store = new Map<string, string>();
      const redis = makeRedis({
        get: vi.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
        set: vi.fn((key: string, value: string) => {
          store.set(key, value);
          return Promise.resolve('OK' as const);
        }),
      });
      const repo = makeRepo();
      const svc = makeService(repo, makeAvailabilityService(), redis);

      await svc.bookAppointment(TUTOR_ID, bookInput, 'shared-key');
      await svc.bookAppointment(OTHER_TUTOR_ID, bookInput, 'shared-key');

      expect(repo.book).toHaveBeenCalledTimes(2);
    });
  });

  describe('getAppointment', () => {
    it('returns appointment for tutor', async () => {
      const svc = makeService(makeRepo(), makeAvailabilityService(), makeRedis());
      const result = await svc.getAppointment(APPT_ID, TUTOR_ID);
      expect(result.id).toBe(APPT_ID);
    });

    it('returns appointment for the owning vet, resolving the vet id from the user id', async () => {
      const svc = makeService(makeRepo(), makeAvailabilityService(), makeRedis());
      const result = await svc.getAppointment(APPT_ID, VET_USER_ID);
      expect(result.id).toBe(APPT_ID);
    });

    it('throws NotFound when appointment does not exist', async () => {
      const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) });
      const svc = makeService(repo, makeAvailabilityService(), makeRedis());
      await expect(svc.getAppointment('missing', TUTOR_ID)).rejects.toThrow(AppointmentNotFoundError);
    });

    it('throws Forbidden when user is not tutor or vet', async () => {
      const svc = makeService(makeRepo(), makeAvailabilityService(), makeRedis());
      await expect(svc.getAppointment(APPT_ID, 'stranger')).rejects.toThrow(AppointmentForbiddenError);
    });

    it('throws Forbidden for a different vet', async () => {
      const svc = makeService(makeRepo(), makeAvailabilityService(), makeRedis());
      await expect(svc.getAppointment(APPT_ID, OTHER_VET_USER_ID)).rejects.toThrow(
        AppointmentForbiddenError,
      );
    });
  });

  describe('confirmAppointment', () => {
    it('confirms when vet owns and status is requested', async () => {
      const repo = makeRepo();
      const svc = makeService(repo, makeAvailabilityService(), makeRedis());
      const result = await svc.confirmAppointment(APPT_ID, VET_USER_ID);
      expect(result.status).toBe('confirmed');
      expect(repo.updateStatus).toHaveBeenCalledWith(APPT_ID, 'confirmed', 'veterinarianId', VET_ID);
    });

    it('throws Forbidden when caller is a different vet', async () => {
      const svc = makeService(makeRepo(), makeAvailabilityService(), makeRedis());
      await expect(svc.confirmAppointment(APPT_ID, OTHER_VET_USER_ID)).rejects.toThrow(
        AppointmentForbiddenError,
      );
    });

    it('throws VeterinarianNotFoundError when caller has no vet profile', async () => {
      const svc = makeService(makeRepo(), makeAvailabilityService(), makeRedis());
      await expect(svc.confirmAppointment(APPT_ID, TUTOR_ID)).rejects.toThrow(
        VeterinarianNotFoundError,
      );
    });

    it('throws TransitionError when status is not requested', async () => {
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue({ ...baseAppointment, status: 'cancelled' }),
      });
      const svc = makeService(repo, makeAvailabilityService(), makeRedis());
      await expect(svc.confirmAppointment(APPT_ID, VET_USER_ID)).rejects.toThrow(
        AppointmentTransitionError,
      );
    });
  });

  describe('cancelAppointment', () => {
    it('allows tutor to cancel', async () => {
      const repo = makeRepo();
      const svc = makeService(repo, makeAvailabilityService(), makeRedis());
      const result = await svc.cancelAppointment(APPT_ID, TUTOR_ID);
      expect(result.status).toBe('cancelled');
      expect(repo.updateStatus).toHaveBeenCalledWith(APPT_ID, 'cancelled', 'tutorId', TUTOR_ID);
    });

    it('allows the owning vet to cancel', async () => {
      const repo = makeRepo();
      const svc = makeService(repo, makeAvailabilityService(), makeRedis());
      const result = await svc.cancelAppointment(APPT_ID, VET_USER_ID);
      expect(result.status).toBe('cancelled');
      expect(repo.updateStatus).toHaveBeenCalledWith(APPT_ID, 'cancelled', 'veterinarianId', VET_ID);
    });

    it('throws Forbidden for strangers', async () => {
      const svc = makeService(makeRepo(), makeAvailabilityService(), makeRedis());
      await expect(svc.cancelAppointment(APPT_ID, 'stranger')).rejects.toThrow(AppointmentForbiddenError);
    });

    it('throws Forbidden for a different vet', async () => {
      const svc = makeService(makeRepo(), makeAvailabilityService(), makeRedis());
      await expect(svc.cancelAppointment(APPT_ID, OTHER_VET_USER_ID)).rejects.toThrow(
        AppointmentForbiddenError,
      );
    });

    it('throws TransitionError when already cancelled', async () => {
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue({ ...baseAppointment, status: 'cancelled' }),
      });
      const svc = makeService(repo, makeAvailabilityService(), makeRedis());
      await expect(svc.cancelAppointment(APPT_ID, TUTOR_ID)).rejects.toThrow(AppointmentTransitionError);
    });
  });

  describe('completeAppointment', () => {
    it('completes when vet owns and status is confirmed', async () => {
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue({ ...baseAppointment, status: 'confirmed' }),
      });
      const svc = makeService(repo, makeAvailabilityService(), makeRedis());
      const result = await svc.completeAppointment(APPT_ID, VET_USER_ID);
      expect(result.status).toBe('completed');
    });

    it('throws Forbidden when caller is a different vet', async () => {
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue({ ...baseAppointment, status: 'confirmed' }),
      });
      const svc = makeService(repo, makeAvailabilityService(), makeRedis());
      await expect(svc.completeAppointment(APPT_ID, OTHER_VET_USER_ID)).rejects.toThrow(
        AppointmentForbiddenError,
      );
    });

    it('throws TransitionError when status is not confirmed', async () => {
      const svc = makeService(makeRepo(), makeAvailabilityService(), makeRedis());
      await expect(svc.completeAppointment(APPT_ID, VET_USER_ID)).rejects.toThrow(
        AppointmentTransitionError,
      );
    });
  });

  describe('listMyAppointments', () => {
    it('lists by tutor', async () => {
      const repo = makeRepo();
      const svc = makeService(repo, makeAvailabilityService(), makeRedis());
      await svc.listMyAppointments(TUTOR_ID, 'tutor');
      expect(repo.findByTutor).toHaveBeenCalledWith(TUTOR_ID);
    });

    it('lists by vet, resolving the vet id from the user id first', async () => {
      const repo = makeRepo();
      const svc = makeService(repo, makeAvailabilityService(), makeRedis());
      await svc.listMyAppointments(VET_USER_ID, 'veterinarian');
      expect(repo.findByVet).toHaveBeenCalledWith(VET_ID);
    });

    it('throws VeterinarianNotFoundError when the vet user has no vet profile', async () => {
      const svc = makeService(makeRepo(), makeAvailabilityService(), makeRedis());
      await expect(svc.listMyAppointments('no-profile', 'veterinarian')).rejects.toThrow(
        VeterinarianNotFoundError,
      );
    });
  });
});
