import { HttpStatus } from '@nestjs/common';

import { DomainError } from '../../shared/errors/domain.error';

export class PetSitterBookingNotFoundError extends DomainError {
  constructor() {
    super('PET_SITTER_BOOKING_NOT_FOUND', 'Reserva não encontrada.', HttpStatus.NOT_FOUND);
  }
}

export class PetSitterBookingForbiddenError extends DomainError {
  constructor() {
    super('PET_SITTER_BOOKING_FORBIDDEN', 'Acesso negado a esta reserva.', HttpStatus.FORBIDDEN);
  }
}

export class InvalidPetSitterHoldTokenError extends DomainError {
  constructor() {
    super(
      'INVALID_PET_SITTER_HOLD_TOKEN',
      'A reserva do horário expirou. Por favor, tente novamente.',
      HttpStatus.CONFLICT,
    );
  }
}

export class PetSitterBookingTransitionError extends DomainError {
  constructor(message: string) {
    super('INVALID_PET_SITTER_BOOKING_TRANSITION', message, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

export class PetSitterBookingAddressRequiredError extends DomainError {
  constructor() {
    super(
      'PET_SITTER_BOOKING_ADDRESS_REQUIRED',
      'Informe um endereço para este serviço.',
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}
