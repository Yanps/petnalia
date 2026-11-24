import { Module } from '@nestjs/common';

import { AddressesController } from './addresses.controller';
import { AddressesRepository } from './addresses.repository';
import { AddressesService } from './addresses.service';
import { GeoController } from './geo.controller';
import { GeocoderService } from './geocoder.service';

@Module({
  controllers: [AddressesController, GeoController],
  providers: [AddressesService, AddressesRepository, GeocoderService],
  exports: [AddressesService, GeocoderService],
})
export class AddressesModule {}
