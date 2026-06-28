import { z } from 'zod';

import { SlotStatusSchema } from './common.js';

export const AvailabilitySlotSchema = z.object({
  id: z.string().uuid(),
  veterinarianId: z.string().uuid(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  status: SlotStatusSchema,
  recurrenceId: z.string().uuid().nullable(),
});
export type AvailabilitySlot = z.infer<typeof AvailabilitySlotSchema>;

export const CreateSlotsInputSchema = z.object({
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
export type CreateSlotsInput = z.infer<typeof CreateSlotsInputSchema>;

export const AvailabilityQuerySchema = z.object({
  veterinarianId: z.string().uuid(),
  from: z.string().datetime(),
  to: z.string().datetime(),
});
export type AvailabilityQuery = z.infer<typeof AvailabilityQuerySchema>;
