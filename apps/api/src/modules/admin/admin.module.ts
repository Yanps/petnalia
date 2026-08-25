import { Module } from '@nestjs/common';

import { AppointmentsModule } from '../appointments/appointments.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PetSittersModule } from '../pet-sitters/pet-sitters.module';
import { UsersModule } from '../users/users.module';
import { VeterinariansModule } from '../veterinarians/veterinarians.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [VeterinariansModule, NotificationsModule, UsersModule, AppointmentsModule, PetSittersModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
