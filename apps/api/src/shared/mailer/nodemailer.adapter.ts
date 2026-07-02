import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';

import type { MailerPort, SendMailOptions } from './mailer.port';

@Injectable()
export class NodemailerAdapter implements MailerPort {
  private readonly logger = new Logger(NodemailerAdapter.name);
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(@Inject(ConfigService) config: ConfigService) {
    this.from = config.get('SMTP_FROM', 'PetNalia <noreply@petnalia.com.br>');

    this.transporter = createTransport({
      host: config.get('SMTP_HOST', 'localhost'),
      port: config.get<number>('SMTP_PORT', 1025),
      secure: config.get('SMTP_SECURE', 'false') === 'true',
      auth:
        config.get('SMTP_USER')
          ? {
              user: config.get<string>('SMTP_USER')!,
              pass: config.get<string>('SMTP_PASS', ''),
            }
          : undefined,
    });
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      this.logger.debug(`E-mail enviado para ${options.to}: ${options.subject}`);
    } catch (err) {
      this.logger.error(`Falha ao enviar e-mail para ${options.to}: ${String(err)}`);
      throw err;
    }
  }
}
