import { HttpStatus } from '@nestjs/common';

import { DomainError } from '../../shared/errors/domain.error';

export class NotificationNotFoundError extends DomainError {
  constructor() {
    super('NOTIFICATION_NOT_FOUND', 'Notificação não encontrada.', HttpStatus.NOT_FOUND);
  }
}
