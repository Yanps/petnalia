import { describe, expect, it, vi, beforeEach } from 'vitest';

import { AppointmentsService } from './appointments.service';
import { AppointmentsRepository } from './appointments.repository';
import { AvailabilityService } from '../availability/availability.service';
import { RedisService } from '../../shared/redis/redis.service';
import {
  AppointmentForbiddenError,
  AppointmentNotFoundError,
  AppointmentTransitionError,
  InvalidHoldTokenError,
} from './appointments.errors';

const TUTOR_ID = 'aaaaaaaa-0000-0000-0000-000000000000';
const VET_ID = 'bbbbbbbb-0000-0000-0000-000000000000';
const SLOT_ID = 'cccccccc-0000-0000-0000-000000000000';
const APPT_ID = 'dddddddd-0000-0000-0000-000000000000';

const baseAppointment = {
  id: APPT_ID,
  tutorId: TUTOR_ID,
  veterinarianId: VET_ID,
  petId: 'pet-1',
  addressId: 'addr-1',
  slotId: SLOT_ID,
  modality: 'home' as const,
  status: 'requested' as const,
  priceCents: 0,
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

function makeService(
  repo: AppointmentsRepository,
  avail: AvailabilityService,
  redis: RedisService,
) {
  return new AppointmentsService(repo, avail, redis);
}

describe('AppointmentsService', () => {
  describe('bookAppointment', () => {
    it('books when hold token is valid', async () => {
      const svc = makeService(makeRepo(), makeAvailabilityService(), makeRedis());
      const result = await svc.bookAppointment(
        TUTOR_ID,
        {
          veterinarianId: VET_ID,
          petId: 'pet-1',
          addressId: 'addr-1',
          slotId: SLOT_ID,
          holdToken: 'valid-token',
          modality: 'home',
        },
      );
      expect(result.id).toBe(APPT_ID);
      expect(result.scheduledAt).toBe('2026-01-05T09:00:00.000Z');
    });

    it('throws InvalidHoldTokenError when token is wrong', async () => {
      const avail = makeAvailabilityService({ verifyHoldToken: vi.fn().mockResolvedValue(false) });
      const svc = makeService(makeRepo(), avail, makeRedis());
      await expect(
        svc.bookAppointment(TUTOR_ID, {
          veterinarianId: VET_ID,
          petId: 'pet-1',
          addressId: 'addr-1',
          slotId: SLOT_ID,
          holdToken: 'wrong-token',
          modality: 'home',
        }),
      ).rejects.toThrow(InvalidHoldTokenError);
    });

    it('returns cached result when idempotency key already exists', async () => {
      const cached = JSON.stringify({ id: APPT_ID, status: 'requested' });
      const redis = makeRedis({ get: vi.fn().mockResolvedValue(cached) });
      const repo = makeRepo();
      const svc = makeService(repo, makeAvailabilityService(), redis);

      const result = await svc.bookAppointment(
        TUTOR_ID,
        { veterinarianId: VET_ID, petId: 'p', addressId: 'a', slotId: SLOT_ID, holdToken: 't', modality: 'home' },
        'idem-key-123',
      );
      expect(result.id).toBe(APPT_ID);
      expect(repo.book).not.toHaveBeenCalled();
    });
  });

  describe('getAppointment', () => {
    it('returns appointment for tutor', async () => {
      const svc = makeService(makeRepo(), makeAvailabilityService(), makeRedis());
      const result = await svc.getAppointment(APPT_ID, TUTOR_ID);
      expect(result.id).toBe(APPT_ID);
    });

    it('returns appointment for vet', async () => {
      const svc = makeService(makeRepo(), makeAvailabilityService(), makeRedis());
      const result = await svc.getAppointment(APPT_ID, VET_ID);
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
  });

  describe('confirmAppointment', () => {
    it('confirms when vet owns and status is requested', async () => {
      const svc = makeService(makeRepo(), makeAvailabilityService(), makeRedis());
      const result = await svc.confirmAppointment(APPT_ID, VET_ID);
      expect(result.status).toBe('confirmed');
    });

    it('throws Forbidden when caller is not the vet', async () => {
      const svc = makeService(makeRepo(), makeAvailabilityService(), makeRedis());
      await expect(svc.confirmAppointment(APPT_ID, TUTOR_ID)).rejects.toThrow(AppointmentForbiddenError);
    });

    it('throws TransitionError when status is not requested', async () => {
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue({ ...baseAppointment, status: 'cancelled' }),
      });
      const svc = makeService(repo, makeAvailabilityService(), makeRedis());
      await expect(svc.confirmAppointment(APPT_ID, VET_ID)).rejects.toThrow(AppointmentTransitionError);
    });
  });

  describe('cancelAppointment', () => {
    it('allows tutor to cancel', async () => {
      const svc = makeService(makeRepo(), makeAvailabilityService(), makeRedis());
      const result = await svc.cancelAppointment(APPT_ID, TUTOR_ID);
      expect(result.status).toBe('cancelled');
    });

    it('allows vet to cancel', async () => {
      const svc = makeService(makeRepo(), makeAvailabilityService(), makeRedis());
      const result = await svc.cancelAppointment(APPT_ID, VET_ID);
      expect(result.status).toBe('cancelled');
    });

    it('throws Forbidden for strangers', async () => {
      const svc = makeService(makeRepo(), makeAvailabilityService(), makeRedis());
      await expect(svc.cancelAppointment(APPT_ID, 'stranger')).rejects.toThrow(AppointmentForbiddenError);
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
      const result = await svc.completeAppointment(APPT_ID, VET_ID);
      expect(result.status).toBe('completed');
    });

    it('throws TransitionError when status is not confirmed', async () => {
      const svc = makeService(makeRepo(), makeAvailabilityService(), makeRedis());
      await expect(svc.completeAppointment(APPT_ID, VET_ID)).rejects.toThrow(AppointmentTransitionError);
    });
  });
});
