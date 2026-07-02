import { Module } from '@nestjs/common';

import { NotificationsRepository } from './notifications.repository';
import { NotificationsService } from './notifications.service';
import { EmailProcessor } from './email.processor';

@Module({
  providers: [NotificationsService, NotificationsRepository, EmailProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}
