import { Injectable } from '@nestjs/common';

import { GeoRepository } from './geo.repository';

@Injectable()
export class GeoService {
  constructor(private readonly geoRepository: GeoRepository) {}

  // TODO: searchVetsNearAddress(lat, lon, radiusKm)
  // TODO: setAddressCoordinates(addressId, lat, lon)
}
