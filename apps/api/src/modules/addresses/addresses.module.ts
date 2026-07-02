import { Module } from '@nestjs/common';
import { AddressesController } from './addresses.controller';
import { AddressesRepository } from './addresses.repository';
import { AddressesService } from './addresses.service';
import { GeocoderService } from './geocoder.service';

@Module({
  controllers: [AddressesController],
  providers: [AddressesService, AddressesRepository, GeocoderService],
  exports: [AddressesService],
})
export class AddressesModule {}
