import { Inject, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';

import { MAILER_PORT, type MailerPort } from '../../shared/mailer/mailer.port';
import { renderEmail, type EmailJobPayload } from '../../shared/mailer/email-templates';
import { QUEUE_EMAIL } from '../../shared/queue/queue.module';

@Processor(QUEUE_EMAIL)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(@Inject(MAILER_PORT) private readonly mailer: MailerPort) {
    super();
  }

  async process(job: Job<EmailJobPayload>): Promise<void> {
    const payload = job.data;
    this.logger.debug(`Processando job de e-mail: ${payload.type} → ${payload.to}`);

    try {
      const { subject, html, text } = renderEmail(payload);
      await this.mailer.sendMail({ to: payload.to, subject, html, text });
    } catch (err) {
      this.logger.error(`Falha ao processar job ${job.id}: ${String(err)}`);
      throw err; // BullMQ will retry according to job options
    }
  }
}
