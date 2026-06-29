import { HttpStatus, Injectable } from '@nestjs/common';
import type { CreateAddressInput } from '@petnalia/types';

import { DomainError } from '../../shared/errors/domain.error';
import { AddressesRepository } from './addresses.repository';

export class AddressNotFoundError extends DomainError {
  constructor() {
    super('ADDRESS_NOT_FOUND', 'Endereço não encontrado.', HttpStatus.NOT_FOUND);
  }
}

@Injectable()
export class AddressesService {
  constructor(private readonly addressesRepository: AddressesRepository) {}

  async listAddresses(userId: string) {
    return this.addressesRepository.findByUser(userId);
  }

  async createAddress(userId: string, dto: CreateAddressInput) {
    return this.addressesRepository.create(userId, dto);
  }

  async deleteAddress(id: string, userId: string): Promise<void> {
    const count = await this.addressesRepository.delete(id, userId);
    if (count === 0) throw new AddressNotFoundError();
  }
}
