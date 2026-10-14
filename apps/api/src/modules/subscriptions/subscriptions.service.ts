import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';


import {
  InvalidWebhookSignatureError,
  SubscriptionNotFoundError,
  VetNotFoundError,
} from './subscriptions.errors';
import { SubscriptionsRepository } from './subscriptions.repository';
import { RedisService } from '../../shared/redis/redis.service';
import { VeterinariansRepository } from '../veterinarians/veterinarians.repository';

const WEBHOOK_EVENT_TTL_SECONDS = 7 * 24 * 60 * 60; // Stripe retries for up to 3 days
const WEBHOOK_EVENT_KEY = (eventId: string) => `stripe:event:${eventId}`;

const PLAN_PRICE_CENTS: Record<string, number> = {
  pro: 4900,
  clinic: 14900,
};

@Injectable()
export class SubscriptionsService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly subscriptionsRepo: SubscriptionsRepository,
    private readonly vetsRepo: VeterinariansRepository,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {
    this.stripe = new Stripe(config.getOrThrow<string>('STRIPE_SECRET_KEY'));
  }

  async getMySubscription(userId: string) {
    const vetId = await this.vetsRepo.findIdByUserId(userId);
    if (!vetId) throw new VetNotFoundError();
    return this.subscriptionsRepo.findByVetId(vetId);
  }

  async createCheckoutSession(userId: string, plan: 'pro' | 'clinic'): Promise<{ url: string }> {
    const vetId = await this.vetsRepo.findIdByUserId(userId);
    if (!vetId) throw new VetNotFoundError();

    const priceId =
      plan === 'pro'
        ? this.config.getOrThrow<string>('STRIPE_PRICE_PRO')
        : this.config.getOrThrow<string>('STRIPE_PRICE_CLINIC');

    const appUrl = this.config.get<string>('APP_URL', 'http://localhost:3001');

    const existing = await this.subscriptionsRepo.findByVetId(vetId);

    const params: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/vet/planos?success=true`,
      cancel_url: `${appUrl}/vet/planos?cancelled=true`,
      metadata: { vetId, plan },
      ...(existing?.providerCustomerId
        ? { customer: existing.providerCustomerId }
        : {}),
    };

    const session = await this.stripe.checkout.sessions.create(params);

    return { url: session.url! };
  }

  async cancelSubscription(userId: string): Promise<void> {
    const vetId = await this.vetsRepo.findIdByUserId(userId);
    if (!vetId) throw new VetNotFoundError();

    const sub = await this.subscriptionsRepo.findByVetId(vetId);
    if (!sub?.providerSubscriptionId) throw new SubscriptionNotFoundError();

    await this.stripe.subscriptions.update(sub.providerSubscriptionId, {
      cancel_at_period_end: true,
    });

    await this.subscriptionsRepo.update(vetId, { cancelAtPeriodEnd: true });
  }

  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    const secret = this.config.getOrThrow<string>('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch {
      throw new InvalidWebhookSignatureError();
    }

    // Stripe delivers at-least-once: claim the event id so a redelivery is a no-op.
    const claimKey = WEBHOOK_EVENT_KEY(event.id);
    const claimed = await this.redis.set(claimKey, '1', 'EX', WEBHOOK_EVENT_TTL_SECONDS, 'NX');
    if (claimed !== 'OK') {
      this.logger.log('Stripe event already processed, skipping', { eventId: event.id });
      return;
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        default:
          break;
      }
    } catch (error) {
      // Release the claim so Stripe's retry gets processed.
      await this.redis.del(claimKey);
      throw error;
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const { vetId, plan } = session.metadata ?? {};
    if (!vetId || !plan) {
      this.logger.warn('checkout.session.completed missing metadata', { sessionId: session.id });
      return;
    }

    if (!session.subscription || !session.customer) {
      this.logger.warn('checkout.session.completed missing subscription/customer', { sessionId: session.id });
      return;
    }

    await this.subscriptionsRepo.upsert(vetId, {
      plan,
      status: 'active',
      // Webhook payloads are not expanded, but the Stripe types allow either an id or an object.
      providerCustomerId:
        typeof session.customer === 'string' ? session.customer : session.customer.id,
      providerSubscriptionId:
        typeof session.subscription === 'string' ? session.subscription : session.subscription.id,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      priceCents: PLAN_PRICE_CENTS[plan] ?? 0,
    });

    await this.vetsRepo.updateTier(vetId, 'premium');
  }

  private async handleSubscriptionUpdated(stripeSub: Stripe.Subscription): Promise<void> {
    const sub = await this.subscriptionsRepo.findByProviderSubscriptionId(stripeSub.id);
    if (!sub) return;

    const status = this.mapStripeStatus(stripeSub.status);

    await this.subscriptionsRepo.update(sub.veterinarianId, {
      status,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
    });

    if (status === 'active' || status === 'trialing') {
      await this.vetsRepo.updateTier(sub.veterinarianId, 'premium');
    } else {
      await this.vetsRepo.updateTier(sub.veterinarianId, 'free');
    }
  }

  private async handleSubscriptionDeleted(stripeSub: Stripe.Subscription): Promise<void> {
    const sub = await this.subscriptionsRepo.findByProviderSubscriptionId(stripeSub.id);
    if (!sub) return;

    await this.subscriptionsRepo.update(sub.veterinarianId, { status: 'cancelled' });
    await this.vetsRepo.updateTier(sub.veterinarianId, 'free');
  }

  private mapStripeStatus(stripeStatus: Stripe.Subscription.Status): 'active' | 'past_due' | 'cancelled' | 'trialing' {
    switch (stripeStatus) {
      case 'active': return 'active';
      case 'trialing': return 'trialing';
      case 'past_due':
      case 'unpaid': return 'past_due';
      default: return 'cancelled';
    }
  }
}
