import type Stripe from 'stripe';
import { describe, expect, it, vi, type Mock } from 'vitest';


import {
  InvalidWebhookSignatureError,
  SubscriptionNotFoundError,
  VetNotFoundError,
} from './subscriptions.errors';
import type { SubscriptionsRepository } from './subscriptions.repository';
import { SubscriptionsService } from './subscriptions.service';
import type { VeterinariansRepository } from '../veterinarians/veterinarians.repository';

const USER_ID = 'aaaaaaaa-0000-0000-0000-000000000000';
const VET_ID = 'bbbbbbbb-0000-0000-0000-000000000000';
const SUB_ID = 'cccccccc-0000-0000-0000-000000000000';
const STRIPE_SUB_ID = 'sub_test123';
const STRIPE_CUSTOMER_ID = 'cus_test123';
const STRIPE_SESSION_URL = 'https://checkout.stripe.com/pay/test_session';

const baseSub = {
  id: SUB_ID,
  veterinarianId: VET_ID,
  plan: 'pro',
  status: 'active' as const,
  provider: 'stripe',
  providerCustomerId: STRIPE_CUSTOMER_ID,
  providerSubscriptionId: STRIPE_SUB_ID,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  priceCents: 4900,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeSubRepo(overrides: Partial<SubscriptionsRepository> = {}) {
  return {
    findByVetId: vi.fn().mockResolvedValue(baseSub),
    findByProviderSubscriptionId: vi.fn().mockResolvedValue(baseSub),
    upsert: vi.fn().mockResolvedValue(baseSub),
    update: vi.fn().mockResolvedValue(baseSub),
    ...overrides,
  } as unknown as SubscriptionsRepository;
}

function makeVetsRepo(overrides: Partial<VeterinariansRepository> = {}) {
  return {
    findIdByUserId: vi.fn().mockResolvedValue(VET_ID),
    updateTier: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as VeterinariansRepository;
}

function makeConfig(overrides: Record<string, string> = {}) {
  const values: Record<string, string> = {
    STRIPE_SECRET_KEY: 'sk_test_dummy',
    STRIPE_PRICE_PRO: 'price_pro_test',
    STRIPE_PRICE_CLINIC: 'price_clinic_test',
    STRIPE_WEBHOOK_SECRET: 'whsec_test',
    APP_URL: 'http://localhost:3001',
    ...overrides,
  };
  return {
    getOrThrow: vi.fn((key: string) => {
      if (key in values) return values[key];
      throw new Error(`Config key not found: ${key}`);
    }),
    get: vi.fn((key: string, fallback?: string) => values[key] ?? fallback),
  };
}

// In-memory stand-in for the Redis commands the webhook dedup uses (SET NX / DEL).
function makeRedis() {
  const store = new Map<string, string>();
  return {
    set: vi.fn((key: string, value: string, ...args: unknown[]) => {
      if (args.includes('NX') && store.has(key)) return Promise.resolve(null);
      store.set(key, value);
      return Promise.resolve('OK');
    }),
    del: vi.fn((key: string) => Promise.resolve(store.delete(key) ? 1 : 0)),
  };
}

function makeService(
  subRepo?: Partial<SubscriptionsRepository>,
  vetsRepo?: Partial<VeterinariansRepository>,
) {
  const svc = new SubscriptionsService(
    makeSubRepo(subRepo),
    makeVetsRepo(vetsRepo),
    makeConfig() as never,
    makeRedis() as never,
  );

  // Stub stripe instance on the service
  (svc as unknown as { stripe: Stripe }).stripe = {
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({ url: STRIPE_SESSION_URL }),
      },
    },
    subscriptions: {
      update: vi.fn().mockResolvedValue({}),
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  } as unknown as Stripe;

  return svc;
}

interface StripeStub {
  checkout: { sessions: { create: Mock } };
  subscriptions: { update: Mock };
  webhooks: { constructEvent: Mock };
}

function stripeOf(svc: SubscriptionsService): StripeStub {
  return (svc as unknown as { stripe: StripeStub }).stripe;
}

describe('SubscriptionsService', () => {
  describe('getMySubscription', () => {
    it('returns subscription for vet', async () => {
      const svc = makeService();
      const result = await svc.getMySubscription(USER_ID);
      expect(result).toEqual(baseSub);
    });

    it('throws VetNotFoundError when vet not found', async () => {
      const svc = makeService(undefined, { findIdByUserId: vi.fn().mockResolvedValue(null) });
      await expect(svc.getMySubscription(USER_ID)).rejects.toThrow(VetNotFoundError);
    });
  });

  describe('createCheckoutSession', () => {
    it('creates checkout session for pro plan', async () => {
      const svc = makeService({ findByVetId: vi.fn().mockResolvedValue(null) });
      const result = await svc.createCheckoutSession(USER_ID, 'pro');
      expect(result).toEqual({ url: STRIPE_SESSION_URL });
      expect(stripeOf(svc).checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'subscription',
          line_items: [{ price: 'price_pro_test', quantity: 1 }],
          metadata: { vetId: VET_ID, plan: 'pro' },
        }),
      );
    });

    it('creates checkout session for clinic plan', async () => {
      const svc = makeService({ findByVetId: vi.fn().mockResolvedValue(null) });
      const result = await svc.createCheckoutSession(USER_ID, 'clinic');
      expect(result).toEqual({ url: STRIPE_SESSION_URL });
      expect(stripeOf(svc).checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: [{ price: 'price_clinic_test', quantity: 1 }],
        }),
      );
    });

    it('returns the vet to the subscription page after checkout', async () => {
      const svc = makeService({ findByVetId: vi.fn().mockResolvedValue(null) });
      await svc.createCheckoutSession(USER_ID, 'pro');
      expect(stripeOf(svc).checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          success_url: 'http://localhost:3001/vet/assinatura?success=true',
          cancel_url: 'http://localhost:3001/vet/assinatura?cancelled=true',
        }),
      );
    });

    it('reuses existing customer id if subscription exists', async () => {
      const svc = makeService();
      await svc.createCheckoutSession(USER_ID, 'pro');
      expect(stripeOf(svc).checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({ customer: STRIPE_CUSTOMER_ID }),
      );
    });

    it('throws VetNotFoundError when vet not found', async () => {
      const svc = makeService(undefined, { findIdByUserId: vi.fn().mockResolvedValue(null) });
      await expect(svc.createCheckoutSession(USER_ID, 'pro')).rejects.toThrow(VetNotFoundError);
    });
  });

  describe('cancelSubscription', () => {
    it('sets cancel_at_period_end on Stripe and updates DB', async () => {
      const svc = makeService();
      await svc.cancelSubscription(USER_ID);
      expect(stripeOf(svc).subscriptions.update).toHaveBeenCalledWith(
        STRIPE_SUB_ID,
        { cancel_at_period_end: true },
      );
    });

    it('throws VetNotFoundError when vet not found', async () => {
      const svc = makeService(undefined, { findIdByUserId: vi.fn().mockResolvedValue(null) });
      await expect(svc.cancelSubscription(USER_ID)).rejects.toThrow(VetNotFoundError);
    });

    it('throws SubscriptionNotFoundError when no stripe subscription id', async () => {
      const svc = makeService({
        findByVetId: vi.fn().mockResolvedValue({ ...baseSub, providerSubscriptionId: null }),
      });
      await expect(svc.cancelSubscription(USER_ID)).rejects.toThrow(SubscriptionNotFoundError);
    });
  });

  describe('handleWebhook', () => {
    function checkoutCompleted(id: string): Stripe.Event {
      return {
        id,
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test',
            subscription: STRIPE_SUB_ID,
            customer: STRIPE_CUSTOMER_ID,
            metadata: { vetId: VET_ID, plan: 'pro' },
          } as unknown as Stripe.Checkout.Session,
        },
      } as unknown as Stripe.Event;
    }

    it('processes a redelivered Stripe event only once', async () => {
      const upsertSpy = vi.fn().mockResolvedValue(baseSub);
      const svc = makeService({ upsert: upsertSpy });
      stripeOf(svc).webhooks.constructEvent = vi.fn().mockReturnValue(checkoutCompleted('evt_1'));

      await svc.handleWebhook(Buffer.from('{}'), 'valid-sig');
      await svc.handleWebhook(Buffer.from('{}'), 'valid-sig');

      expect(upsertSpy).toHaveBeenCalledTimes(1);
    });

    it('releases the event claim when processing fails, so the Stripe retry is processed', async () => {
      const upsertSpy = vi
        .fn()
        .mockRejectedValueOnce(new Error('db down'))
        .mockResolvedValue(baseSub);
      const svc = makeService({ upsert: upsertSpy });
      stripeOf(svc).webhooks.constructEvent = vi.fn().mockReturnValue(checkoutCompleted('evt_2'));

      await expect(svc.handleWebhook(Buffer.from('{}'), 'valid-sig')).rejects.toThrow('db down');
      await svc.handleWebhook(Buffer.from('{}'), 'valid-sig');

      expect(upsertSpy).toHaveBeenCalledTimes(2);
    });

    it('throws InvalidWebhookSignatureError on bad signature', async () => {
      const svc = makeService();
      stripeOf(svc).webhooks.constructEvent = vi.fn().mockImplementation(() => {
        throw new Error('Invalid signature');
      });
      await expect(
        svc.handleWebhook(Buffer.from('{}'), 'bad-sig'),
      ).rejects.toThrow(InvalidWebhookSignatureError);
    });

    it('handles checkout.session.completed event', async () => {
      const upsertSpy = vi.fn().mockResolvedValue(baseSub);
      const updateTierSpy = vi.fn().mockResolvedValue(undefined);
      const svc = makeService({ upsert: upsertSpy }, { updateTier: updateTierSpy });

      const event: Stripe.Event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test',
            subscription: STRIPE_SUB_ID,
            customer: STRIPE_CUSTOMER_ID,
            metadata: { vetId: VET_ID, plan: 'pro' },
          } as unknown as Stripe.Checkout.Session,
        },
      } as unknown as Stripe.Event;

      stripeOf(svc).webhooks.constructEvent = vi.fn().mockReturnValue(event);

      await svc.handleWebhook(Buffer.from('{}'), 'valid-sig');

      expect(upsertSpy).toHaveBeenCalledWith(
        VET_ID,
        expect.objectContaining({
          plan: 'pro',
          status: 'active',
          providerSubscriptionId: STRIPE_SUB_ID,
          providerCustomerId: STRIPE_CUSTOMER_ID,
          priceCents: 4900,
        }),
      );
      expect(updateTierSpy).toHaveBeenCalledWith(VET_ID, 'premium');
    });

    it('handles customer.subscription.deleted event', async () => {
      const updateSpy = vi.fn().mockResolvedValue(baseSub);
      const updateTierSpy = vi.fn().mockResolvedValue(undefined);
      const svc = makeService({ update: updateSpy }, { updateTier: updateTierSpy });

      const event: Stripe.Event = {
        type: 'customer.subscription.deleted',
        data: {
          object: { id: STRIPE_SUB_ID, status: 'canceled' } as unknown as Stripe.Subscription,
        },
      } as unknown as Stripe.Event;

      stripeOf(svc).webhooks.constructEvent = vi.fn().mockReturnValue(event);

      await svc.handleWebhook(Buffer.from('{}'), 'valid-sig');

      expect(updateSpy).toHaveBeenCalledWith(VET_ID, { status: 'cancelled' });
      expect(updateTierSpy).toHaveBeenCalledWith(VET_ID, 'free');
    });

    it('ignores checkout.session.completed with missing metadata', async () => {
      const upsertSpy = vi.fn();
      const svc = makeService({ upsert: upsertSpy });

      const event: Stripe.Event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test',
            subscription: STRIPE_SUB_ID,
            customer: STRIPE_CUSTOMER_ID,
            metadata: {},
          } as unknown as Stripe.Checkout.Session,
        },
      } as unknown as Stripe.Event;

      stripeOf(svc).webhooks.constructEvent = vi.fn().mockReturnValue(event);
      await svc.handleWebhook(Buffer.from('{}'), 'valid-sig');

      expect(upsertSpy).not.toHaveBeenCalled();
    });
  });
});
