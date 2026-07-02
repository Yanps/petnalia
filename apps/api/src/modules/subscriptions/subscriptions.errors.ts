import { HttpStatus } from '@nestjs/common';

import { DomainError } from '../../shared/errors/domain.error';

export class VetNotFoundError extends DomainError {
  constructor() {
    super('VETERINARIAN_NOT_FOUND', 'Veterinário não encontrado.', HttpStatus.NOT_FOUND);
  }
}

export class SubscriptionNotFoundError extends DomainError {
  constructor() {
    super('SUBSCRIPTION_NOT_FOUND', 'Assinatura não encontrada.', HttpStatus.NOT_FOUND);
  }
}

export class SubscriptionAlreadyActiveError extends DomainError {
  constructor() {
    super('SUBSCRIPTION_ALREADY_ACTIVE', 'Você já possui uma assinatura ativa.', HttpStatus.CONFLICT);
  }
}

export class InvalidWebhookSignatureError extends DomainError {
  constructor() {
    super('INVALID_WEBHOOK_SIGNATURE', 'Assinatura do webhook inválida.', HttpStatus.BAD_REQUEST);
  }
}
