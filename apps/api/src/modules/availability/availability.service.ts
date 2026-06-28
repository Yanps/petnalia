import { Injectable } from '@nestjs/common';

import { AvailabilityRepository } from './availability.repository';

@Injectable()
export class AvailabilityService {
  constructor(private readonly availabilityRepository: AvailabilityRepository) {}

  // TODO: getOpenSlots(vetId, from, to)
  // TODO: createSlots(vetId, dto)
  // TODO: holdSlot(slotId) — returns holdToken, auto-releases after SLOT_HOLD_MINUTES
  // TODO: confirmSlot(slotId, holdToken)
}
