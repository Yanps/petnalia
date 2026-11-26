import { Module } from '@nestjs/common';


import { PetSitterAvailabilityController } from './pet-sitter-availability.controller';
import { PetSitterAvailabilityRepository } from './pet-sitter-availability.repository';
import { PetSitterAvailabilityService } from './pet-sitter-availability.service';
import { PetSittersModule } from '../pet-sitters/pet-sitters.module';

@Module({
  imports: [PetSittersModule],
  controllers: [PetSitterAvailabilityController],
  providers: [PetSitterAvailabilityService, PetSitterAvailabilityRepository],
  exports: [PetSitterAvailabilityService],
})
export class PetSitterAvailabilityModule {}
