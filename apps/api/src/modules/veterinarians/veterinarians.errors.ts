import { HttpStatus } from '@nestjs/common';

import { DomainError } from '../../shared/errors/domain.error';

export class VeterinarianNotFoundError extends DomainError {
  constructor() {
    super('VETERINARIAN_NOT_FOUND', 'Veterinário não encontrado.', HttpStatus.NOT_FOUND);
  }
}
