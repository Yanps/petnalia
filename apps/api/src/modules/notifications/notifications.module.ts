import { Module } from '@nestjs/common';

import { EmailProcessor } from './email.processor';
import { NotificationsController } from './notifications.controller';
import { NotificationsRepository } from './notifications.repository';
import { NotificationsService } from './notifications.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsRepository, EmailProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}
