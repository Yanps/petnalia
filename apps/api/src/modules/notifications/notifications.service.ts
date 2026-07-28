import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import type { Notification, NotificationChannel, NotificationListResponse, PaginationQuery } from '@petnalia/types';
import type { Notification as PrismaNotification } from '@prisma/client';

import { QUEUE_EMAIL } from '../../shared/queue/queue.module';
import type { EmailJobPayload } from '../../shared/mailer/email-templates';
import { NotificationNotFoundError } from './notifications.errors';
import { NotificationsRepository } from './notifications.repository';

export interface NotifyInput {
  readonly userId: string;
  readonly type: string;
  readonly channel: NotificationChannel;
  readonly payload: Record<string, unknown>;
  readonly status?: 'pending' | 'sent' | 'failed';
}

function toNotification(row: PrismaNotification): Notification {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type,
    channel: row.channel,
    payload: row.payload as Record<string, unknown>,
    readAt: row.readAt?.toISOString() ?? null,
    sentAt: row.sentAt?.toISOString() ?? null,
    status: row.status as Notification['status'],
    createdAt: row.createdAt.toISOString(),
  };
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectQueue(QUEUE_EMAIL) private readonly emailQueue: Queue<EmailJobPayload>,
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  async enqueueEmail(payload: EmailJobPayload): Promise<void> {
    try {
      await this.emailQueue.add(payload.type, payload, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5_000 },
        removeOnComplete: true,
        removeOnFail: { count: 100 },
      });
    } catch (err) {
      // Log but never throw — notification failures must not break the main flow
      this.logger.error(`Falha ao enfileirar e-mail (${payload.type}) para ${payload.to}: ${String(err)}`);
    }
  }

  async notify(input: NotifyInput): Promise<void> {
    await this.notificationsRepository.create({
      userId: input.userId,
      type: input.type,
      channel: input.channel,
      payload: input.payload,
      status: input.status ?? 'pending',
    });
  }

  async list(userId: string, pagination: PaginationQuery): Promise<NotificationListResponse> {
    const { items, total } = await this.notificationsRepository.findByUser(
      userId,
      pagination.page,
      pagination.limit,
    );

    return {
      items: items.map(toNotification),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const updated = await this.notificationsRepository.markAsRead(notificationId, userId);
    if (!updated) throw new NotificationNotFoundError();
  }
}
