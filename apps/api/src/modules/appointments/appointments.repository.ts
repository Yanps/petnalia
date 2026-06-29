import { Injectable } from '@nestjs/common';
import type { Appointment, AppointmentStatus } from '@prisma/client';
import type { CreateAppointmentInput } from '@petnalia/types';

import { PrismaService } from '../../shared/prisma/prisma.service';

type AppointmentWithSlot = Appointment & {
  slot: { startsAt: Date; endsAt: Date };
};

type BookData = Omit<CreateAppointmentInput, 'holdToken'> & {
  tutorId: string;
  priceCents: number;
};

type PrismaTx = Parameters<Parameters<PrismaService['$transaction']>[0]>[0];

@Injectable()
export class AppointmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<AppointmentWithSlot | null> {
    return this.prisma.appointment.findUnique({
      where: { id, deletedAt: null },
      include: { slot: { select: { startsAt: true, endsAt: true } } },
    });
  }

  async findByTutor(tutorId: string): Promise<AppointmentWithSlot[]> {
    return this.prisma.appointment.findMany({
      where: { tutorId, deletedAt: null },
      include: { slot: { select: { startsAt: true, endsAt: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByVet(veterinarianId: string): Promise<AppointmentWithSlot[]> {
    return this.prisma.appointment.findMany({
      where: { veterinarianId, deletedAt: null },
      include: { slot: { select: { startsAt: true, endsAt: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async book(data: BookData, tx: PrismaTx): Promise<Appointment> {
    return tx.appointment.create({
      data: {
        tutorId: data.tutorId,
        veterinarianId: data.veterinarianId,
        petId: data.petId,
        addressId: data.addressId,
        slotId: data.slotId,
        modality: data.modality,
        priceCents: data.priceCents,
        notes: data.notes ?? null,
        status: 'requested',
      },
    });
  }

  async updateStatus(
    id: string,
    status: AppointmentStatus,
    ownerField: 'tutorId' | 'veterinarianId',
    ownerId: string,
  ): Promise<Appointment | null> {
    try {
      return await this.prisma.appointment.update({
        where: { id, [ownerField]: ownerId, deletedAt: null },
        data: { status },
      });
    } catch {
      return null;
    }
  }

  getPrisma(): PrismaService {
    return this.prisma;
  }
}
