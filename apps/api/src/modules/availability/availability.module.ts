import { Module } from '@nestjs/common';


import { AvailabilityController } from './availability.controller';
import { AvailabilityRepository } from './availability.repository';
import { AvailabilityService } from './availability.service';
import { VeterinariansModule } from '../veterinarians/veterinarians.module';

@Module({
  imports: [VeterinariansModule],
  controllers: [AvailabilityController],
  providers: [AvailabilityService, AvailabilityRepository],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
