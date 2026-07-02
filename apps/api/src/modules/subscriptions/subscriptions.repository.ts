import { Injectable } from '@nestjs/common';
import type { Subscription, SubscriptionStatus } from '@prisma/client';

import { PrismaService } from '../../shared/prisma/prisma.service';

export interface UpsertSubscriptionData {
  readonly plan: string;
  readonly status: SubscriptionStatus;
  readonly providerCustomerId: string;
  readonly providerSubscriptionId: string;
  readonly currentPeriodEnd: Date | null;
  readonly cancelAtPeriodEnd: boolean;
  readonly priceCents: number;
}

export interface UpdateSubscriptionData {
  readonly status?: SubscriptionStatus;
  readonly currentPeriodEnd?: Date | null;
  readonly cancelAtPeriodEnd?: boolean;
  readonly providerSubscriptionId?: string;
}

@Injectable()
export class SubscriptionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByVetId(veterinarianId: string): Promise<Subscription | null> {
    return this.prisma.subscription.findUnique({ where: { veterinarianId } });
  }

  async findByProviderSubscriptionId(providerSubscriptionId: string): Promise<Subscription | null> {
    return this.prisma.subscription.findFirst({ where: { providerSubscriptionId } });
  }

  async upsert(veterinarianId: string, data: UpsertSubscriptionData): Promise<Subscription> {
    return this.prisma.subscription.upsert({
      where: { veterinarianId },
      create: {
        veterinarianId,
        plan: data.plan,
        status: data.status,
        provider: 'stripe',
        providerCustomerId: data.providerCustomerId,
        providerSubscriptionId: data.providerSubscriptionId,
        currentPeriodEnd: data.currentPeriodEnd,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd,
        priceCents: data.priceCents,
      },
      update: {
        plan: data.plan,
        status: data.status,
        providerCustomerId: data.providerCustomerId,
        providerSubscriptionId: data.providerSubscriptionId,
        currentPeriodEnd: data.currentPeriodEnd,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd,
        priceCents: data.priceCents,
      },
    });
  }

  async update(veterinarianId: string, data: UpdateSubscriptionData): Promise<Subscription> {
    return this.prisma.subscription.update({
      where: { veterinarianId },
      data,
    });
  }
}
