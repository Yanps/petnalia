import { Controller, Get, HttpCode, HttpStatus, Param, Patch, Query } from '@nestjs/common';
import type { User } from '@prisma/client';

import { PaginationQuerySchema } from '@petnalia/types';

import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { UuidParamPipe } from '../../shared/pipes/uuid-param.pipe';


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
  async markAsRead(@CurrentUser() user: User, @Param('id', UuidParamPipe) id: string): Promise<void> {
    await this.notificationsService.markAsRead(id, user.id);
  }
}
