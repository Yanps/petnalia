import { HttpStatus, Injectable } from '@nestjs/common';
import type { CreateAddressInput } from '@petnalia/types';

import { PrismaService } from '../../shared/prisma/prisma.service';
import { DomainError } from '../../shared/errors/domain.error';
import { AddressesRepository } from './addresses.repository';
import { GeocoderService } from './geocoder.service';

export class AddressNotFoundError extends DomainError {
  constructor() {
    super('ADDRESS_NOT_FOUND', 'Endereço não encontrado.', HttpStatus.NOT_FOUND);
  }
}

@Injectable()
export class AddressesService {
  constructor(
    private readonly addressesRepository: AddressesRepository,
    private readonly geocoder: GeocoderService,
    private readonly prisma: PrismaService,
  ) {}

  async listAddresses(userId: string) {
    return this.addressesRepository.findByUser(userId);
  }

  async createAddress(userId: string, dto: CreateAddressInput) {
    const address = await this.addressesRepository.create(userId, dto);

    // Fire-and-forget geocodification — does not block the response
    this.geocodeAndUpdate(address.id, dto.cep).catch(() => {
      // logged inside geocoder
    });

    return address;
  }

  async deleteAddress(id: string, userId: string): Promise<void> {
    const count = await this.addressesRepository.delete(id, userId);
    if (count === 0) throw new AddressNotFoundError();
  }

  private async geocodeAndUpdate(addressId: string, cep: string): Promise<void> {
    const point = await this.geocoder.lookupCep(cep);
    if (!point) return;

    // PostGIS geography column requires raw SQL — Prisma does not support Unsupported types in writes
    await this.prisma.$executeRaw`
      UPDATE addresses
      SET geog = ST_SetSRID(ST_MakePoint(${point.lng}::float8, ${point.lat}::float8), 4326)::geography
      WHERE id = ${addressId}::uuid
    `;
  }
}
