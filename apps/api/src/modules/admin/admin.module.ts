import { Module } from '@nestjs/common';

import { NotificationsModule } from '../notifications/notifications.module';
import { VeterinariansModule } from '../veterinarians/veterinarians.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [VeterinariansModule, NotificationsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
