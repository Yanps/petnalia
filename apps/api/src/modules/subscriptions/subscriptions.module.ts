import { Module } from '@nestjs/common';

import { VeterinariansModule } from '../veterinarians/veterinarians.module';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsRepository } from './subscriptions.repository';
import { SubscriptionsService } from './subscriptions.service';

@Module({
  imports: [VeterinariansModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, SubscriptionsRepository],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
