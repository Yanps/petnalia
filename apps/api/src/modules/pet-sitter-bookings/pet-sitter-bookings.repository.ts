import { Injectable } from '@nestjs/common';
import type { PetSitterBooking, PetSitterBookingStatus } from '@prisma/client';

import type { CreatePetSitterBookingInput } from '@petnalia/types';

import { PrismaService } from '../../shared/prisma/prisma.service';

type PetSitterBookingWithSlot = PetSitterBooking & {
  slot: { startsAt: Date; endsAt: Date };
};

type BookData = Omit<CreatePetSitterBookingInput, 'holdToken'> & {
  tutorId: string;
};

type PrismaTx = Parameters<Parameters<PrismaService['$transaction']>[0]>[0];

@Injectable()
export class PetSitterBookingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<PetSitterBookingWithSlot | null> {
    return this.prisma.petSitterBooking.findUnique({
      where: { id, deletedAt: null },
      include: { slot: { select: { startsAt: true, endsAt: true } } },
    });
  }

  async findByTutor(tutorId: string): Promise<PetSitterBookingWithSlot[]> {
    return this.prisma.petSitterBooking.findMany({
      where: { tutorId, deletedAt: null },
      include: { slot: { select: { startsAt: true, endsAt: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySitter(petSitterId: string): Promise<PetSitterBookingWithSlot[]> {
    return this.prisma.petSitterBooking.findMany({
      where: { petSitterId, deletedAt: null },
      include: { slot: { select: { startsAt: true, endsAt: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async book(data: BookData, tx: PrismaTx): Promise<PetSitterBooking> {
    return tx.petSitterBooking.create({
      data: {
        tutorId: data.tutorId,
        petSitterId: data.petSitterId,
        petId: data.petId,
        addressId: data.addressId ?? null,
        slotId: data.slotId,
        service: data.service,
        notes: data.notes ?? null,
        status: 'requested',
      },
    });
  }

  async updateStatus(
    id: string,
    status: PetSitterBookingStatus,
    ownerField: 'tutorId' | 'petSitterId',
    ownerId: string,
  ): Promise<PetSitterBooking | null> {
    try {
      return await this.prisma.petSitterBooking.update({
        where: { id, [ownerField]: ownerId, deletedAt: null },
        data: { status },
      });
    } catch {
      return null;
    }
  }

  async findParticipants(bookingId: string) {
    return this.prisma.petSitterBooking.findUnique({
      where: { id: bookingId },
      include: {
        tutor: { include: { profile: true } },
        pet: { select: { name: true } },
        petSitter: { include: { user: true } },
        slot: { select: { startsAt: true } },
      },
    });
  }

  getPrisma(): PrismaService {
    return this.prisma;
  }
}
