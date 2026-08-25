import { Injectable } from '@nestjs/common';
import type { PetSitterAvailabilitySlot } from '@prisma/client';
import type { CreatePetSitterSlotsInput, PetSitterAvailabilityQuery } from '@petnalia/types';

import { PrismaService } from '../../shared/prisma/prisma.service';

const HOLD_MINUTES = 10;

type PrismaTx = Parameters<Parameters<PrismaService['$transaction']>[0]>[0];

@Injectable()
export class PetSitterAvailabilityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOpenSlots(query: PetSitterAvailabilityQuery): Promise<PetSitterAvailabilitySlot[]> {
    const now = new Date();
    return this.prisma.petSitterAvailabilitySlot.findMany({
      where: {
        petSitterId: query.petSitterId,
        startsAt: { gte: new Date(query.from), lte: new Date(query.to) },
        OR: [{ status: 'open' }, { status: 'held', heldUntil: { lt: now } }],
      },
      orderBy: { startsAt: 'asc' },
    });
  }

  async createSlots(petSitterId: string, slots: CreatePetSitterSlotsInput['slots']): Promise<number> {
    const result = await this.prisma.petSitterAvailabilitySlot.createMany({
      data: slots.map((s) => ({
        petSitterId,
        startsAt: new Date(s.startsAt),
        endsAt: new Date(s.endsAt),
        status: 'open' as const,
      })),
      skipDuplicates: true,
    });
    return result.count;
  }

  async holdSlot(slotId: string): Promise<PetSitterAvailabilitySlot | null> {
    const heldUntil = new Date(Date.now() + HOLD_MINUTES * 60 * 1000);
    const now = new Date();
    try {
      return await this.prisma.petSitterAvailabilitySlot.update({
        where: {
          id: slotId,
          OR: [{ status: 'open' }, { status: 'held', heldUntil: { lt: now } }],
        },
        data: { status: 'held', heldUntil },
      });
    } catch {
      return null;
    }
  }

  async bookSlot(slotId: string, tx: PrismaTx): Promise<boolean> {
    try {
      await tx.petSitterAvailabilitySlot.update({
        where: { id: slotId, status: 'held' },
        data: { status: 'booked', heldUntil: null },
      });
      return true;
    } catch {
      return false;
    }
  }

  async releaseSlot(slotId: string): Promise<void> {
    await this.prisma.petSitterAvailabilitySlot.updateMany({
      where: { id: slotId, status: 'held' },
      data: { status: 'open', heldUntil: null },
    });
  }

  async findSlotById(slotId: string): Promise<PetSitterAvailabilitySlot | null> {
    return this.prisma.petSitterAvailabilitySlot.findUnique({ where: { id: slotId } });
  }
}
