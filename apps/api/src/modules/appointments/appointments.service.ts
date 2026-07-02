import { Injectable } from '@nestjs/common';
import type { Appointment } from '@petnalia/types';
import type { CreateAppointmentInput } from '@petnalia/types';

import { RedisService } from '../../shared/redis/redis.service';
import { AvailabilityService } from '../availability/availability.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  AppointmentForbiddenError,
  AppointmentNotFoundError,
  AppointmentTransitionError,
  InvalidHoldTokenError,
} from './appointments.errors';
import { AppointmentsRepository } from './appointments.repository';

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
  priceCents: number;
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

    const valid = await this.availabilityService.verifyHoldToken(dto.slotId, dto.holdToken);
    if (!valid) throw new InvalidHoldTokenError();

    const prisma = this.appointmentsRepository.getPrisma();
    const repo = this.availabilityService.getRepository();

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
          priceCents: 0,
        },
        tx,
      );
    });

    await this.redis.del(`slot:hold:${dto.slotId}`);

    const slot = await repo.findSlotById(dto.slotId);
    const result = toAppointment({ ...appointment, slot: { startsAt: slot!.startsAt } });

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

  async listMyAppointments(
    userId: string,
    role: 'tutor' | 'veterinarian',
    veterinarianId?: string,
  ): Promise<Appointment[]> {
    const rows =
      role === 'tutor'
        ? await this.appointmentsRepository.findByTutor(userId)
        : await this.appointmentsRepository.findByVet(veterinarianId ?? userId);

    return rows.map(toAppointment);
  }

  async getAppointment(id: string, userId: string): Promise<Appointment> {
    const row = await this.appointmentsRepository.findById(id);
    if (!row) throw new AppointmentNotFoundError();
    if (row.tutorId !== userId && row.veterinarianId !== userId) {
      throw new AppointmentForbiddenError();
    }
    return toAppointment(row);
  }

  async confirmAppointment(appointmentId: string, userId: string): Promise<Appointment> {
    const row = await this.appointmentsRepository.findById(appointmentId);
    if (!row) throw new AppointmentNotFoundError();
    if (row.veterinarianId !== userId) throw new AppointmentForbiddenError();
    if (row.status !== 'requested') {
      throw new AppointmentTransitionError('Apenas consultas pendentes podem ser confirmadas.');
    }
    const updated = await this.appointmentsRepository.updateStatus(
      appointmentId,
      'confirmed',
      'veterinarianId',
      userId,
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
    const isVet = row.veterinarianId === userId;
    if (!isTutor && !isVet) throw new AppointmentForbiddenError();

    if (row.status === 'completed' || row.status === 'cancelled') {
      throw new AppointmentTransitionError('Consulta já encerrada ou cancelada.');
    }

    const ownerField = isTutor ? 'tutorId' : 'veterinarianId';
    const updated = await this.appointmentsRepository.updateStatus(
      appointmentId,
      'cancelled',
      ownerField,
      userId,
    );
    void this.notifyAppointmentCancelled(appointmentId);
    return toAppointment({ ...row, ...updated!, slot: row.slot });
  }

  async completeAppointment(appointmentId: string, userId: string): Promise<Appointment> {
    const row = await this.appointmentsRepository.findById(appointmentId);
    if (!row) throw new AppointmentNotFoundError();
    if (row.veterinarianId !== userId) throw new AppointmentForbiddenError();
    if (row.status !== 'confirmed') {
      throw new AppointmentTransitionError('Apenas consultas confirmadas podem ser concluídas.');
    }
    const updated = await this.appointmentsRepository.updateStatus(
      appointmentId,
      'completed',
      'veterinarianId',
      userId,
    );
    return toAppointment({ ...row, ...updated!, slot: row.slot });
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
