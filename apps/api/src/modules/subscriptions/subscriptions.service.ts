import { Injectable } from '@nestjs/common';

import { SubscriptionsRepository } from './subscriptions.repository';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly subscriptionsRepository: SubscriptionsRepository) {}

  // TODO: getSubscription(vetId)
  // TODO: createCheckoutSession(vetId, plan) — Stripe session
  // TODO: handleWebhook(payload, signature) — Stripe webhook handler (idempotent)
  // TODO: cancelSubscription(vetId)
}
