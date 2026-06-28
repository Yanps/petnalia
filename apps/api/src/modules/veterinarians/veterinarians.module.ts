import { Module } from '@nestjs/common';

import { VeterinariansController } from './veterinarians.controller';
import { VeterinariansRepository } from './veterinarians.repository';
import { VeterinariansService } from './veterinarians.service';

@Module({
  controllers: [VeterinariansController],
  providers: [VeterinariansService, VeterinariansRepository],
  exports: [VeterinariansService, VeterinariansRepository],
})
export class VeterinariansModule {}
