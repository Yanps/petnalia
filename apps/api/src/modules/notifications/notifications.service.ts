import { Injectable } from '@nestjs/common';

import { NotificationsRepository } from './notifications.repository';

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationsRepository: NotificationsRepository) {}

  // TODO: dispatch(userId, type, channel, payload) — persists + enqueues email job
  // TODO: markAsRead(notificationId, userId)
  // TODO: listNotifications(userId, pagination)
  // Listens to domain events: appointment.confirmed, appointment.cancelled, etc.
}
