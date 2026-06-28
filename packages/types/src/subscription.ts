import { z } from 'zod';

import { SubscriptionStatusSchema } from './common.js';

export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  veterinarianId: z.string().uuid(),
  plan: z.enum(['monthly', 'annual']),
  status: SubscriptionStatusSchema,
  provider: z.literal('stripe'),
  providerCustomerId: z.string().nullable(),
  providerSubscriptionId: z.string().nullable(),
  currentPeriodEnd: z.string().datetime().nullable(),
  cancelAtPeriodEnd: z.boolean().default(false),
  priceCents: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Subscription = z.infer<typeof SubscriptionSchema>;

export const CreateSubscriptionInputSchema = z.object({
  plan: z.enum(['monthly', 'annual']),
});
export type CreateSubscriptionInput = z.infer<typeof CreateSubscriptionInputSchema>;
