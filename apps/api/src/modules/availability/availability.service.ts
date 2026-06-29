import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import type { AvailabilitySlot } from '@prisma/client';
import type { AvailabilityQuery, CreateSlotsInput, HoldSlotResponse } from '@petnalia/types';
import { randomUUID } from 'crypto';

import { DomainError } from '../../shared/errors/domain.error';
import { RedisService } from '../../shared/redis/redis.service';
import { AvailabilityRepository } from './availability.repository';

const HOLD_TTL_SECONDS = 600;
const HOLD_KEY = (slotId: string) => `slot:hold:${slotId}`;

export class SlotNotAvailableError extends DomainError {
  constructor() {
    super('SLOT_NOT_AVAILABLE', 'Este horário não está disponível.', HttpStatus.CONFLICT);
  }
}

export class SlotNotFoundError extends DomainError {
  constructor() {
    super('SLOT_NOT_FOUND', 'Horário não encontrado.', HttpStatus.NOT_FOUND);
  }
}

@Injectable()
export class AvailabilityService {
  constructor(
    private readonly availabilityRepository: AvailabilityRepository,
    private readonly redis: RedisService,
  ) {}

  async getOpenSlots(query: AvailabilityQuery): Promise<AvailabilitySlot[]> {
    return this.availabilityRepository.findOpenSlots(query);
  }

  async createSlots(veterinarianId: string, dto: CreateSlotsInput): Promise<{ created: number }> {
    const count = await this.availabilityRepository.createSlots(veterinarianId, dto.slots);
    return { created: count };
  }

  async holdSlot(slotId: string): Promise<HoldSlotResponse> {
    const slot = await this.availabilityRepository.holdSlot(slotId);
    if (!slot) throw new SlotNotAvailableError();

    const holdToken = randomUUID();
    const expiresAt = new Date(Date.now() + HOLD_TTL_SECONDS * 1000);

    await this.redis.set(HOLD_KEY(slotId), holdToken, 'EX', HOLD_TTL_SECONDS);

    return { holdToken, expiresAt: expiresAt.toISOString() };
  }

  async verifyHoldToken(slotId: string, holdToken: string): Promise<boolean> {
    const stored = await this.redis.get(HOLD_KEY(slotId));
    return stored === holdToken;
  }

  async releaseHold(slotId: string): Promise<void> {
    await this.redis.del(HOLD_KEY(slotId));
    await this.availabilityRepository.releaseSlot(slotId);
  }

  getRepository(): AvailabilityRepository {
    return this.availabilityRepository;
  }
}
