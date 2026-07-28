import { HttpStatus } from '@nestjs/common';

import { DomainError } from '../../shared/errors/domain.error';

export class UserNotFoundError extends DomainError {
  constructor() {
    super('USER_NOT_FOUND', 'Usuário não encontrado.', HttpStatus.NOT_FOUND);
  }
}
