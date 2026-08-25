import { HttpStatus, Injectable } from '@nestjs/common';
import type { PetSitterAvailabilitySlot } from '@prisma/client';
import type { CreatePetSitterSlotsInput, HoldSlotResponse, PetSitterAvailabilityQuery } from '@petnalia/types';
import { randomUUID } from 'crypto';

import { DomainError } from '../../shared/errors/domain.error';
import { RedisService } from '../../shared/redis/redis.service';
import { PetSitterNotFoundError } from '../pet-sitters/pet-sitters.errors';
import { PetSittersRepository } from '../pet-sitters/pet-sitters.repository';
import { PetSitterAvailabilityRepository } from './pet-sitter-availability.repository';

const HOLD_TTL_SECONDS = 600;
const HOLD_KEY = (slotId: string) => `pet-sitter-slot:hold:${slotId}`;

export class PetSitterSlotNotAvailableError extends DomainError {
  constructor() {
    super('PET_SITTER_SLOT_NOT_AVAILABLE', 'Este horário não está disponível.', HttpStatus.CONFLICT);
  }
}

@Injectable()
export class PetSitterAvailabilityService {
  constructor(
    private readonly availabilityRepository: PetSitterAvailabilityRepository,
    private readonly petSittersRepository: PetSittersRepository,
    private readonly redis: RedisService,
  ) {}

  async getOpenSlots(query: PetSitterAvailabilityQuery): Promise<PetSitterAvailabilitySlot[]> {
    return this.availabilityRepository.findOpenSlots(query);
  }

  async createSlotsForUser(userId: string, dto: CreatePetSitterSlotsInput): Promise<{ created: number }> {
    const sitter = await this.petSittersRepository.findByUserId(userId);
    if (!sitter) throw new PetSitterNotFoundError();

    const count = await this.availabilityRepository.createSlots(sitter.id, dto.slots);
    return { created: count };
  }

  async holdSlot(slotId: string): Promise<HoldSlotResponse> {
    const slot = await this.availabilityRepository.holdSlot(slotId);
    if (!slot) throw new PetSitterSlotNotAvailableError();

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

  getRepository(): PetSitterAvailabilityRepository {
    return this.availabilityRepository;
  }
}
