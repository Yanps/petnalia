import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';

import { QUEUE_EMAIL } from '../../shared/queue/queue.module';
import type { EmailJobPayload } from '../../shared/mailer/email-templates';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectQueue(QUEUE_EMAIL) private readonly emailQueue: Queue<EmailJobPayload>,
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
}
