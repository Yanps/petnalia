import { Controller } from '@nestjs/common';

import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  // TODO: GET /subscriptions/me (vet)
  // TODO: POST /subscriptions/checkout (vet)
  // TODO: POST /subscriptions/cancel (vet)
  // TODO: POST /subscriptions/webhook (public, Stripe)
}
