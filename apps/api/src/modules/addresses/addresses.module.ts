import { Module } from '@nestjs/common';
import { AddressesController } from './addresses.controller';
import { AddressesRepository } from './addresses.repository';
import { AddressesService } from './addresses.service';
import { GeocoderService } from './geocoder.service';
import { GeoController } from './geo.controller';

@Module({
  controllers: [AddressesController, GeoController],
  providers: [AddressesService, AddressesRepository, GeocoderService],
  exports: [AddressesService, GeocoderService],
})
export class AddressesModule {}
