import { Module } from '@nestjs/common';

import { PetSitterBookingsController } from './pet-sitter-bookings.controller';
import { PetSitterBookingsRepository } from './pet-sitter-bookings.repository';
import { PetSitterBookingsService } from './pet-sitter-bookings.service';
import { AddressesModule } from '../addresses/addresses.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PetSitterAvailabilityModule } from '../pet-sitter-availability/pet-sitter-availability.module';
import { PetSittersModule } from '../pet-sitters/pet-sitters.module';
import { PetsModule } from '../pets/pets.module';


@Module({
  imports: [PetSitterAvailabilityModule, NotificationsModule, PetSittersModule, PetsModule, AddressesModule],
  controllers: [PetSitterBookingsController],
  providers: [PetSitterBookingsService, PetSitterBookingsRepository],
  exports: [PetSitterBookingsService, PetSitterBookingsRepository],
})
export class PetSitterBookingsModule {}
