import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class GeoRepository {
  constructor(private readonly prisma: PrismaService) {}

  // All spatial queries use $queryRaw — PostGIS geography columns are
  // Unsupported() in the Prisma schema; Prisma cannot type them directly.
  // See ARCHITECTURE.md §4.4 and ADR-002.

  // TODO: findVetsWithinRadius(lat, lon, radiusKm) — ST_DWithin
  // TODO: updateAddressPoint(addressId, lat, lon) — SET geog = ST_Point(lon, lat)
  // TODO: distanceBetween(pointA, pointB) — ST_Distance
}
