import { Injectable } from '@nestjs/common';

import type { CreatePetSitterBookingInput, PetSitterBooking } from '@petnalia/types';

import {
  InvalidPetSitterHoldTokenError,
  PetSitterBookingAddressRequiredError,
  PetSitterBookingForbiddenError,
  PetSitterBookingNotFoundError,
  PetSitterBookingTransitionError,
} from './pet-sitter-bookings.errors';
import { PetSitterBookingsRepository } from './pet-sitter-bookings.repository';
import { RedisService } from '../../shared/redis/redis.service';
import { AddressesService } from '../addresses/addresses.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  PetSitterAvailabilityService,
  PetSitterSlotNotFoundError,
} from '../pet-sitter-availability/pet-sitter-availability.service';
import { PetSitterNotFoundError } from '../pet-sitters/pet-sitters.errors';
import { PetSittersRepository } from '../pet-sitters/pet-sitters.repository';
import { PetsService } from '../pets/pets.service';


const IDEM_TTL_SECONDS = 86400;
// Scoped per tutor: a key replayed by another user must never return someone else's booking.
const IDEM_KEY = (tutorId: string, key: string) => `idem:pet-sitter-booking:${tutorId}:${key}`;

// Only services that bring the sitter to the tutor require an address —
// "hospedagem"/"day_care" have the pet go to the sitter instead.
const SERVICES_REQUIRING_ADDRESS = new Set(['passeio', 'visita_domiciliar']);

function toPetSitterBooking(row: {
  id: string;
  tutorId: string;
  petSitterId: string;
  petId: string;
  addressId: string | null;
  slotId: string;
  service: string;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  slot: { startsAt: Date };
}): PetSitterBooking {
  return {
    id: row.id,
    tutorId: row.tutorId,
    petSitterId: row.petSitterId,
    petId: row.petId,
    addressId: row.addressId,
    slotId: row.slotId,
    service: row.service as PetSitterBooking['service'],
    status: row.status as PetSitterBooking['status'],
    notes: row.notes,
    scheduledAt: row.slot.startsAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

@Injectable()
export class PetSitterBookingsService {
  constructor(
    private readonly bookingsRepository: PetSitterBookingsRepository,
    private readonly availabilityService: PetSitterAvailabilityService,
    private readonly petSittersRepository: PetSittersRepository,
    private readonly petsService: PetsService,
    private readonly addressesService: AddressesService,
    private readonly redis: RedisService,
    private readonly notifications: NotificationsService,
  ) {}

  async bookSitterService(
    tutorId: string,
    dto: CreatePetSitterBookingInput,
    idempotencyKey?: string,
  ): Promise<PetSitterBooking> {
    if (idempotencyKey) {
      const cached = await this.redis.get(IDEM_KEY(tutorId, idempotencyKey));
      if (cached) return JSON.parse(cached) as PetSitterBooking;
    }

    if (SERVICES_REQUIRING_ADDRESS.has(dto.service) && !dto.addressId) {
      throw new PetSitterBookingAddressRequiredError();
    }

    await this.petsService.assertOwnedBy(dto.petId, tutorId);
    if (dto.addressId) await this.addressesService.assertOwnedBy(dto.addressId, tutorId);

    const prisma = this.bookingsRepository.getPrisma();
    const repo = this.availabilityService.getRepository();

    const slot = await repo.findSlotById(dto.slotId);
    if (!slot || slot.petSitterId !== dto.petSitterId) throw new PetSitterSlotNotFoundError();

    const valid = await this.availabilityService.verifyHoldToken(dto.slotId, dto.holdToken);
    if (!valid) throw new InvalidPetSitterHoldTokenError();

    const booking = await prisma.$transaction(async (tx) => {
      const booked = await repo.bookSlot(dto.slotId, tx);
      if (!booked) throw new InvalidPetSitterHoldTokenError();

      return this.bookingsRepository.book(
        {
          tutorId,
          petSitterId: dto.petSitterId,
          petId: dto.petId,
          addressId: dto.addressId,
          slotId: dto.slotId,
          service: dto.service,
          notes: dto.notes,
        },
        tx,
      );
    });

    await this.redis.del(`pet-sitter-slot:hold:${dto.slotId}`);

    const result = toPetSitterBooking({ ...booking, slot: { startsAt: slot.startsAt } });

    if (idempotencyKey) {
      await this.redis.set(IDEM_KEY(tutorId, idempotencyKey), JSON.stringify(result), 'EX', IDEM_TTL_SECONDS);
    }

    void this.notifyBookingRequested(booking.id);

    return result;
  }

  private async notifyBookingRequested(bookingId: string): Promise<void> {
    const data = await this.bookingsRepository.findParticipants(bookingId);
    if (!data) return;

    const startsAt = data.slot.startsAt.toISOString();
    const tutorName = data.tutor.profile?.fullName ?? data.tutor.email;
    const sitterName = data.petSitter.fullName;
    const petName = data.pet.name;

    void this.notifications.enqueueEmail({
      to: data.tutor.email,
      type: 'pet_sitter_booking_requested_tutor',
      name: tutorName,
      scheduledAt: startsAt,
      otherPartyName: sitterName,
      petName,
    });

    void this.notifications.enqueueEmail({
      to: data.petSitter.user.email,
      type: 'pet_sitter_booking_requested_sitter',
      name: sitterName,
      scheduledAt: startsAt,
      otherPartyName: tutorName,
      petName,
    });
  }

  async listMyBookings(userId: string, role: 'tutor' | 'pet_sitter'): Promise<PetSitterBooking[]> {
    if (role === 'tutor') {
      const rows = await this.bookingsRepository.findByTutor(userId);
      return rows.map(toPetSitterBooking);
    }

    const sitter = await this.petSittersRepository.findByUserId(userId);
    if (!sitter) throw new PetSitterNotFoundError();
    const rows = await this.bookingsRepository.findBySitter(sitter.id);
    return rows.map(toPetSitterBooking);
  }

  async getBooking(id: string, userId: string): Promise<PetSitterBooking> {
    const row = await this.bookingsRepository.findById(id);
    if (!row) throw new PetSitterBookingNotFoundError();

    if (row.tutorId === userId) return toPetSitterBooking(row);

    const sitter = await this.petSittersRepository.findByUserId(userId);
    if (!sitter || row.petSitterId !== sitter.id) throw new PetSitterBookingForbiddenError();
    return toPetSitterBooking(row);
  }

  async confirmBooking(bookingId: string, userId: string): Promise<PetSitterBooking> {
    const sitter = await this.petSittersRepository.findByUserId(userId);
    if (!sitter) throw new PetSitterNotFoundError();

    const row = await this.bookingsRepository.findById(bookingId);
    if (!row) throw new PetSitterBookingNotFoundError();
    if (row.petSitterId !== sitter.id) throw new PetSitterBookingForbiddenError();
    if (row.status !== 'requested') {
      throw new PetSitterBookingTransitionError('Apenas reservas pendentes podem ser confirmadas.');
    }

    const updated = await this.bookingsRepository.updateStatus(bookingId, 'confirmed', 'petSitterId', sitter.id);
    void this.notifyBookingConfirmed(bookingId);
    return toPetSitterBooking({ ...row, ...updated! });
  }

  async cancelBooking(bookingId: string, userId: string): Promise<PetSitterBooking> {
    const row = await this.bookingsRepository.findById(bookingId);
    if (!row) throw new PetSitterBookingNotFoundError();

    const isTutor = row.tutorId === userId;
    const sitter = isTutor ? null : await this.petSittersRepository.findByUserId(userId);
    const isSitter = !!sitter && row.petSitterId === sitter.id;
    if (!isTutor && !isSitter) throw new PetSitterBookingForbiddenError();

    if (row.status === 'completed' || row.status === 'cancelled') {
      throw new PetSitterBookingTransitionError('Reserva já encerrada ou cancelada.');
    }

    const ownerField = isTutor ? 'tutorId' : 'petSitterId';
    const ownerId = isTutor ? userId : sitter!.id;
    const updated = await this.bookingsRepository.updateStatus(bookingId, 'cancelled', ownerField, ownerId);
    void this.notifyBookingCancelled(bookingId);
    return toPetSitterBooking({ ...row, ...updated! });
  }

  async completeBooking(bookingId: string, userId: string): Promise<PetSitterBooking> {
    const sitter = await this.petSittersRepository.findByUserId(userId);
    if (!sitter) throw new PetSitterNotFoundError();

    const row = await this.bookingsRepository.findById(bookingId);
    if (!row) throw new PetSitterBookingNotFoundError();
    if (row.petSitterId !== sitter.id) throw new PetSitterBookingForbiddenError();
    if (row.status !== 'confirmed') {
      throw new PetSitterBookingTransitionError('Apenas reservas confirmadas podem ser concluídas.');
    }

    const updated = await this.bookingsRepository.updateStatus(bookingId, 'completed', 'petSitterId', sitter.id);
    return toPetSitterBooking({ ...row, ...updated! });
  }

  private async notifyBookingConfirmed(bookingId: string): Promise<void> {
    const data = await this.bookingsRepository.findParticipants(bookingId);
    if (!data) return;

    void this.notifications.enqueueEmail({
      to: data.tutor.email,
      type: 'pet_sitter_booking_confirmed',
      name: data.tutor.profile?.fullName ?? data.tutor.email,
      scheduledAt: data.slot.startsAt.toISOString(),
      otherPartyName: data.petSitter.fullName,
    });
  }

  private async notifyBookingCancelled(bookingId: string): Promise<void> {
    const data = await this.bookingsRepository.findParticipants(bookingId);
    if (!data) return;

    const scheduledAt = data.slot.startsAt.toISOString();

    void this.notifications.enqueueEmail({
      to: data.tutor.email,
      type: 'pet_sitter_booking_cancelled',
      name: data.tutor.profile?.fullName ?? data.tutor.email,
      scheduledAt,
    });

    void this.notifications.enqueueEmail({
      to: data.petSitter.user.email,
      type: 'pet_sitter_booking_cancelled',
      name: data.petSitter.fullName,
      scheduledAt,
    });
  }
}
