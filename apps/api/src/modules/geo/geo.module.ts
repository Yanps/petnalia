import { Module } from '@nestjs/common';

import { GeoRepository } from './geo.repository';
import { GeoService } from './geo.service';

@Module({
  providers: [GeoService, GeoRepository],
  exports: [GeoService],
})
export class GeoModule {}
