import { HttpStatus } from '@nestjs/common';

import { DomainError } from '../../shared/errors/domain.error';

export class PetNotFoundError extends DomainError {
  constructor() {
    super('PET_NOT_FOUND', 'Pet não encontrado.', HttpStatus.NOT_FOUND);
  }
}
