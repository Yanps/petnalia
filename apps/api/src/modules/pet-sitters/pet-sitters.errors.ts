import { HttpStatus } from '@nestjs/common';

import { DomainError } from '../../shared/errors/domain.error';

export class PetSitterNotFoundError extends DomainError {
  constructor() {
    super('PET_SITTER_NOT_FOUND', 'Perfil de pet sitter não encontrado.', HttpStatus.NOT_FOUND);
  }
}

export class PetSitterNotFlaggedError extends DomainError {
  constructor() {
    super('PET_SITTER_NOT_FLAGGED', 'Este perfil não está sinalizado para revisão.', HttpStatus.CONFLICT);
  }
}
