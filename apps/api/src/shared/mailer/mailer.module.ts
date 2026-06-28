import { Global, Module } from '@nestjs/common';

import { MAILER_PORT } from './mailer.port';
import { NodemailerAdapter } from './nodemailer.adapter';

@Global()
@Module({
  providers: [{ provide: MAILER_PORT, useClass: NodemailerAdapter }],
  exports: [MAILER_PORT],
})
export class MailerModule {}
