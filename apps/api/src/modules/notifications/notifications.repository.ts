import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // TODO: create(userId, data)
  // TODO: markAsRead(notificationId, userId)
  // TODO: findByUser(userId, pagination)
}
