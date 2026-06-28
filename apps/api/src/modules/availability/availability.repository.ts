import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class AvailabilityRepository {
  constructor(private readonly prisma: PrismaService) {}

  // TODO: findOpenSlots(vetId, from, to)
  // TODO: createSlots(vetId, slots[])
  // TODO: holdSlot(slotId, ttlSeconds) — SET status=held, Redis TTL for auto-release
  // TODO: bookSlot(slotId) — SET status=booked (inside transaction)
  // TODO: releaseSlot(slotId) — SET status=open
}
