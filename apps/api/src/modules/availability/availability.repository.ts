import { Injectable } from '@nestjs/common';
import type { AvailabilitySlot } from '@prisma/client';
import type { AvailabilityQuery, CreateSlotsInput } from '@petnalia/types';

import { PrismaService } from '../../shared/prisma/prisma.service';

const HOLD_MINUTES = 10;

type PrismaTx = Parameters<Parameters<PrismaService['$transaction']>[0]>[0];

@Injectable()
export class AvailabilityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOpenSlots(query: AvailabilityQuery): Promise<AvailabilitySlot[]> {
    const now = new Date();
    return this.prisma.availabilitySlot.findMany({
      where: {
        veterinarianId: query.veterinarianId,
        startsAt: { gte: new Date(query.from), lte: new Date(query.to) },
        OR: [{ status: 'open' }, { status: 'held', heldUntil: { lt: now } }],
      },
      orderBy: { startsAt: 'asc' },
    });
  }

  async createSlots(veterinarianId: string, slots: CreateSlotsInput['slots']): Promise<number> {
    const result = await this.prisma.availabilitySlot.createMany({
      data: slots.map((s) => ({
        veterinarianId,
        startsAt: new Date(s.startsAt),
        endsAt: new Date(s.endsAt),
        status: 'open' as const,
      })),
      skipDuplicates: true,
    });
    return result.count;
  }

  async holdSlot(slotId: string): Promise<AvailabilitySlot | null> {
    const heldUntil = new Date(Date.now() + HOLD_MINUTES * 60 * 1000);
    const now = new Date();
    try {
      return await this.prisma.availabilitySlot.update({
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
      await tx.availabilitySlot.update({
        where: { id: slotId, status: 'held' },
        data: { status: 'booked', heldUntil: null },
      });
      return true;
    } catch {
      return false;
    }
  }

  async releaseSlot(slotId: string): Promise<void> {
    await this.prisma.availabilitySlot.updateMany({
      where: { id: slotId, status: 'held' },
      data: { status: 'open', heldUntil: null },
    });
  }

  async findSlotById(slotId: string): Promise<AvailabilitySlot | null> {
    return this.prisma.availabilitySlot.findUnique({ where: { id: slotId } });
  }
}
