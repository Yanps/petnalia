import { HttpStatus } from '@nestjs/common';

import { DomainError } from '../../shared/errors/domain.error';

export class EmailTakenError extends DomainError {
  constructor() {
    super('AUTH_EMAIL_TAKEN', 'Este e-mail já está em uso.', HttpStatus.CONFLICT);
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('AUTH_INVALID_CREDENTIALS', 'E-mail ou senha inválidos.', HttpStatus.UNAUTHORIZED);
  }
}

export class AccountSuspendedError extends DomainError {
  constructor() {
    super(
      'AUTH_ACCOUNT_SUSPENDED',
      'Conta suspensa. Entre em contato com o suporte.',
      HttpStatus.FORBIDDEN,
    );
  }
}

export class TokenExpiredError extends DomainError {
  constructor() {
    super('AUTH_TOKEN_EXPIRED', 'Sessão expirada. Faça login novamente.', HttpStatus.UNAUTHORIZED);
  }
}

export class TokenRevokedError extends DomainError {
  constructor() {
    super(
      'AUTH_TOKEN_REVOKED',
      'Sessão inválida. Faça login novamente.',
      HttpStatus.UNAUTHORIZED,
    );
  }
}
