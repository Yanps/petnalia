import { z } from 'zod';

import { SubscriptionStatusSchema } from './common.js';

export const SubscriptionPlanSchema = z.enum(['pro', 'clinic']);
export type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>;

export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  veterinarianId: z.string().uuid(),
  plan: SubscriptionPlanSchema,
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

export const CreateCheckoutSessionInputSchema = z.object({
  plan: SubscriptionPlanSchema,
});
export type CreateCheckoutSessionInput = z.infer<typeof CreateCheckoutSessionInputSchema>;

export const CheckoutSessionResponseSchema = z.object({
  url: z.string().url(),
});
export type CheckoutSessionResponse = z.infer<typeof CheckoutSessionResponseSchema>;
