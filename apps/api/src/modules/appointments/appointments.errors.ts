import { HttpStatus } from '@nestjs/common';

import { DomainError } from '../../shared/errors/domain.error';

export class AppointmentNotFoundError extends DomainError {
  constructor() {
    super('APPOINTMENT_NOT_FOUND', 'Consulta não encontrada.', HttpStatus.NOT_FOUND);
  }
}

export class AppointmentForbiddenError extends DomainError {
  constructor() {
    super('APPOINTMENT_FORBIDDEN', 'Acesso negado a esta consulta.', HttpStatus.FORBIDDEN);
  }
}

export class InvalidHoldTokenError extends DomainError {
  constructor() {
    super(
      'INVALID_HOLD_TOKEN',
      'A reserva do horário expirou. Por favor, tente novamente.',
      HttpStatus.CONFLICT,
    );
  }
}

export class AppointmentTransitionError extends DomainError {
  constructor(message: string) {
    super('INVALID_APPOINTMENT_TRANSITION', message, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}
