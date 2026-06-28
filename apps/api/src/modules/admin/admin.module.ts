import { Module } from '@nestjs/common';

import { VeterinariansModule } from '../veterinarians/veterinarians.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [VeterinariansModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
