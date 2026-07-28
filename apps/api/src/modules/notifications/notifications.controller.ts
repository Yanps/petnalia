import { Controller, Get, HttpCode, HttpStatus, Param, Patch, Query } from '@nestjs/common';
import { PaginationQuerySchema } from '@petnalia/types';
import type { User } from '@prisma/client';

import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: User, @Query() rawQuery: unknown) {
    const pagination = PaginationQuerySchema.parse(rawQuery);
    return this.notificationsService.list(user.id, pagination);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAsRead(@CurrentUser() user: User, @Param('id') id: string): Promise<void> {
    await this.notificationsService.markAsRead(id, user.id);
  }
}
