import { Module } from '@nestjs/common';

import { AddressesModule } from '../addresses/addresses.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { PetSittersController } from './pet-sitters.controller';
import { PetSittersRepository } from './pet-sitters.repository';
import { PetSittersService } from './pet-sitters.service';

@Module({
  imports: [AddressesModule, NotificationsModule, UsersModule],
  controllers: [PetSittersController],
  providers: [PetSittersService, PetSittersRepository],
  exports: [PetSittersRepository],
})
export class PetSittersModule {}
