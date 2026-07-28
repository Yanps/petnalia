import { Injectable } from '@nestjs/common';
import type { NotificationChannel, Prisma } from '@prisma/client';

import { PrismaService } from '../../shared/prisma/prisma.service';

export interface CreateNotificationData {
  readonly userId: string;
  readonly type: string;
  readonly channel: NotificationChannel;
  readonly payload: Record<string, unknown>;
  readonly status: string;
}

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateNotificationData) {
    return this.prisma.notification.create({
      data: { ...data, payload: data.payload as Prisma.InputJsonValue },
    });
  }

  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const result = await this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { readAt: new Date() },
    });
    return result.count > 0;
  }

  async findByUser(userId: string, page: number, limit: number) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);
    return { items, total };
  }
}
