import { Injectable } from '@nestjs/common';

import type { Appointment, CreateAppointmentInput, Modality } from '@petnalia/types';

import {
  AppointmentForbiddenError,
  AppointmentNotFoundError,
  AppointmentTransitionError,
  InvalidHoldTokenError,
} from './appointments.errors';
import { AppointmentsRepository } from './appointments.repository';
import { RedisService } from '../../shared/redis/redis.service';
import { AddressesService } from '../addresses/addresses.service';
import { AvailabilityService, SlotNotFoundError } from '../availability/availability.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PetsService } from '../pets/pets.service';
import { VeterinarianNotFoundError } from '../veterinarians/veterinarians.errors';
import { VeterinariansRepository } from '../veterinarians/veterinarians.repository';


// Price snapshot for the booked modality; null = "a combinar" (VETS-01).
function priceForModality(
  vet: { homePriceCents: number | null; onlinePriceCents: number | null },
  modality: Modality,
): number | null {
  switch (modality) {
    case 'home':
      return vet.homePriceCents;
    case 'online':
      return vet.onlinePriceCents;
    default: {
      const exhaustive: never = modality;
      throw new Error(`Unhandled modality: ${String(exhaustive)}`);
    }
  }
}

const IDEM_TTL_SECONDS = 86400;
const IDEM_KEY = (key: string) => `idem:appointment:${key}`;

function toAppointment(row: {
  id: string;
  tutorId: string;
  veterinarianId: string;
  petId: string;
  addressId: string;
  slotId: string;
  modality: string;
  status: string;
  priceCents: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  slot: { startsAt: Date };
}): Appointment {
  return {
    id: row.id,
    tutorId: row.tutorId,
    veterinarianId: row.veterinarianId,
    petId: row.petId,
    addressId: row.addressId,
    slotId: row.slotId,
    modality: row.modality as Appointment['modality'],
    status: row.status as Appointment['status'],
    priceCents: row.priceCents,
    notes: row.notes,
    scheduledAt: row.slot.startsAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly appointmentsRepository: AppointmentsRepository,
    private readonly availabilityService: AvailabilityService,
    private readonly veterinariansRepository: VeterinariansRepository,
    private readonly petsService: PetsService,
    private readonly addressesService: AddressesService,
    private readonly redis: RedisService,
    private readonly notifications: NotificationsService,
  ) {}

  async bookAppointment(
    tutorId: string,
    dto: CreateAppointmentInput,
    idempotencyKey?: string,
  ): Promise<Appointment> {
    if (idempotencyKey) {
      const cached = await this.redis.get(IDEM_KEY(idempotencyKey));
      if (cached) return JSON.parse(cached) as Appointment;
    }

    await this.petsService.assertOwnedBy(dto.petId, tutorId);
    await this.addressesService.assertOwnedBy(dto.addressId, tutorId);

    const prisma = this.appointmentsRepository.getPrisma();
    const repo = this.availabilityService.getRepository();

    const slot = await repo.findSlotById(dto.slotId);
    if (!slot || slot.veterinarianId !== dto.veterinarianId) throw new SlotNotFoundError();

    const valid = await this.availabilityService.verifyHoldToken(dto.slotId, dto.holdToken);
    if (!valid) throw new InvalidHoldTokenError();

    const vet = await this.veterinariansRepository.findVetById(dto.veterinarianId);
    if (!vet) throw new VeterinarianNotFoundError();
    const priceCents = priceForModality(vet, dto.modality);

    const appointment = await prisma.$transaction(async (tx) => {
      const booked = await repo.bookSlot(dto.slotId, tx);
      if (!booked) throw new InvalidHoldTokenError();

      return this.appointmentsRepository.book(
        {
          tutorId,
          veterinarianId: dto.veterinarianId,
          petId: dto.petId,
          addressId: dto.addressId,
          slotId: dto.slotId,
          modality: dto.modality,
          notes: dto.notes,
          priceCents,
        },
        tx,
      );
    });

    await this.redis.del(`slot:hold:${dto.slotId}`);

    const result = toAppointment({ ...appointment, slot: { startsAt: slot.startsAt } });

    if (idempotencyKey) {
      await this.redis.set(IDEM_KEY(idempotencyKey), JSON.stringify(result), 'EX', IDEM_TTL_SECONDS);
    }

    void this.notifyAppointmentBooked(appointment.id);

    return result;
  }

  private async notifyAppointmentBooked(appointmentId: string): Promise<void> {
    const data = await this.appointmentsRepository.findParticipants(appointmentId);
    if (!data) return;

    const scheduledAt = data.slot.startsAt.toISOString();
    const tutorName = data.tutor.profile?.fullName ?? data.tutor.email;
    const vetName = data.veterinarian.user.profile?.fullName ?? data.veterinarian.user.email;
    const petName = data.pet.name;

    void this.notifications.enqueueEmail({
      to: data.tutor.email,
      type: 'appointment_booked_tutor',
      name: tutorName,
      scheduledAt,
      otherPartyName: vetName,
      petName,
    });

    void this.notifications.enqueueEmail({
      to: data.veterinarian.user.email,
      type: 'appointment_booked_vet',
      name: vetName,
      scheduledAt,
      otherPartyName: tutorName,
      petName,
    });
  }

  async listMyAppointments(userId: string, role: 'tutor' | 'veterinarian'): Promise<Appointment[]> {
    if (role === 'tutor') {
      const rows = await this.appointmentsRepository.findByTutor(userId);
      return rows.map(toAppointment);
    }

    const veterinarianId = await this.resolveVeterinarianId(userId);
    const rows = await this.appointmentsRepository.findByVet(veterinarianId);
    return rows.map(toAppointment);
  }

  async getAppointment(id: string, userId: string): Promise<Appointment> {
    const row = await this.appointmentsRepository.findById(id);
    if (!row) throw new AppointmentNotFoundError();

    if (row.tutorId === userId) return toAppointment(row);

    const veterinarianId = await this.veterinariansRepository.findIdByUserId(userId);
    if (row.veterinarianId !== veterinarianId) throw new AppointmentForbiddenError();
    return toAppointment(row);
  }

  async confirmAppointment(appointmentId: string, userId: string): Promise<Appointment> {
    const veterinarianId = await this.resolveVeterinarianId(userId);

    const row = await this.appointmentsRepository.findById(appointmentId);
    if (!row) throw new AppointmentNotFoundError();
    if (row.veterinarianId !== veterinarianId) throw new AppointmentForbiddenError();
    if (row.status !== 'requested') {
      throw new AppointmentTransitionError('Apenas consultas pendentes podem ser confirmadas.');
    }
    const updated = await this.appointmentsRepository.updateStatus(
      appointmentId,
      'confirmed',
      'veterinarianId',
      veterinarianId,
    );
    void this.notifyAppointmentConfirmed(appointmentId);
    return toAppointment({ ...row, ...updated!, slot: row.slot });
  }

  async cancelAppointment(
    appointmentId: string,
    userId: string,
  ): Promise<Appointment> {
    const row = await this.appointmentsRepository.findById(appointmentId);
    if (!row) throw new AppointmentNotFoundError();

    const isTutor = row.tutorId === userId;
    const veterinarianId = isTutor
      ? null
      : await this.veterinariansRepository.findIdByUserId(userId);
    const isVet = veterinarianId !== null && row.veterinarianId === veterinarianId;
    if (!isTutor && !isVet) throw new AppointmentForbiddenError();

    if (row.status === 'completed' || row.status === 'cancelled') {
      throw new AppointmentTransitionError('Consulta já encerrada ou cancelada.');
    }

    const ownerField = isTutor ? 'tutorId' : 'veterinarianId';
    const ownerId = isTutor ? userId : row.veterinarianId;
    const updated = await this.appointmentsRepository.updateStatus(
      appointmentId,
      'cancelled',
      ownerField,
      ownerId,
    );
    void this.notifyAppointmentCancelled(appointmentId);
    return toAppointment({ ...row, ...updated!, slot: row.slot });
  }

  async completeAppointment(appointmentId: string, userId: string): Promise<Appointment> {
    const veterinarianId = await this.resolveVeterinarianId(userId);

    const row = await this.appointmentsRepository.findById(appointmentId);
    if (!row) throw new AppointmentNotFoundError();
    if (row.veterinarianId !== veterinarianId) throw new AppointmentForbiddenError();
    if (row.status !== 'confirmed') {
      throw new AppointmentTransitionError('Apenas consultas confirmadas podem ser concluídas.');
    }
    const updated = await this.appointmentsRepository.updateStatus(
      appointmentId,
      'completed',
      'veterinarianId',
      veterinarianId,
    );
    return toAppointment({ ...row, ...updated!, slot: row.slot });
  }

  // Appointments reference veterinarians.id, while the authenticated principal is users.id.
  private async resolveVeterinarianId(userId: string): Promise<string> {
    const veterinarianId = await this.veterinariansRepository.findIdByUserId(userId);
    if (!veterinarianId) throw new VeterinarianNotFoundError();
    return veterinarianId;
  }

  private async notifyAppointmentConfirmed(appointmentId: string): Promise<void> {
    const data = await this.appointmentsRepository.findParticipants(appointmentId);
    if (!data) return;

    void this.notifications.enqueueEmail({
      to: data.tutor.email,
      type: 'appointment_confirmed',
      name: data.tutor.profile?.fullName ?? data.tutor.email,
      scheduledAt: data.slot.startsAt.toISOString(),
      otherPartyName: data.veterinarian.user.profile?.fullName ?? data.veterinarian.user.email,
    });
  }

  private async notifyAppointmentCancelled(appointmentId: string): Promise<void> {
    const data = await this.appointmentsRepository.findParticipants(appointmentId);
    if (!data) return;

    const scheduledAt = data.slot.startsAt.toISOString();

    void this.notifications.enqueueEmail({
      to: data.tutor.email,
      type: 'appointment_cancelled',
      name: data.tutor.profile?.fullName ?? data.tutor.email,
      scheduledAt,
    });

    void this.notifications.enqueueEmail({
      to: data.veterinarian.user.email,
      type: 'appointment_cancelled',
      name: data.veterinarian.user.profile?.fullName ?? data.veterinarian.user.email,
      scheduledAt,
    });
  }
}
