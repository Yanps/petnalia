import { z } from 'zod';

import { SlotStatusSchema } from './common.js';

export const PetSitterAvailabilitySlotSchema = z.object({
  id: z.string().uuid(),
  petSitterId: z.string().uuid(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  status: SlotStatusSchema,
});
export type PetSitterAvailabilitySlot = z.infer<typeof PetSitterAvailabilitySlotSchema>;

export const CreatePetSitterSlotsInputSchema = z.object({
  slots: z
    .array(
      z.object({
        startsAt: z.string().datetime(),
        endsAt: z.string().datetime(),
      }),
    )
    .min(1)
    .max(100),
});
export type CreatePetSitterSlotsInput = z.infer<typeof CreatePetSitterSlotsInputSchema>;

export const PetSitterAvailabilityQuerySchema = z.object({
  petSitterId: z.string().uuid(),
  from: z.string().datetime(),
  to: z.string().datetime(),
});
export type PetSitterAvailabilityQuery = z.infer<typeof PetSitterAvailabilityQuerySchema>;
