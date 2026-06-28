export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface MailerPort {
  sendMail(options: SendMailOptions): Promise<void>;
}

export const MAILER_PORT = Symbol('MailerPort');
