import { Injectable } from '@nestjs/common';

import type { MailerPort, SendMailOptions } from './mailer.port';

@Injectable()
export class NodemailerAdapter implements MailerPort {
  // TODO: inject nodemailer transporter via ConfigService

  async sendMail(_options: SendMailOptions): Promise<void> {
    // TODO: implement nodemailer transport (MailHog locally, SMTP/SES in prod)
  }
}
