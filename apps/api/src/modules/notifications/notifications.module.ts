import { Module } from '@nestjs/common';

import { NotificationsController } from './notifications.controller';
import { NotificationsRepository } from './notifications.repository';
import { NotificationsService } from './notifications.service';
import { EmailProcessor } from './email.processor';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsRepository, EmailProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}
