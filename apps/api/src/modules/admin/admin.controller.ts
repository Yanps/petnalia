import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { AdminAppointmentsQuerySchema, PaginationQuerySchema, RejectVetInputSchema } from '@petnalia/types';
import type { User } from '@prisma/client';

import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { AdminService } from './admin.service';

@Controller('admin')
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('veterinarians/pending')
  async listPendingVets(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.adminService.listPendingVets(
      Math.max(1, parseInt(page, 10) || 1),
      Math.min(50, parseInt(limit, 10) || 20),
    );
  }

  @Post('veterinarians/:id/approve')
  @HttpCode(HttpStatus.NO_CONTENT)
  async approveVet(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.adminService.approveVet(id);
  }

  @Post('veterinarians/:id/reject')
  @HttpCode(HttpStatus.NO_CONTENT)
  async rejectVet(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ): Promise<void> {
    const dto = RejectVetInputSchema.parse(body);
    await this.adminService.rejectVet(id, dto.reason);
  }

  @Get('users')
  listUsers(@Query() rawQuery: unknown) {
    const query = PaginationQuerySchema.parse(rawQuery);
    return this.adminService.listUsers(query.page, query.limit);
  }

  @Post('users/:id/suspend')
  @HttpCode(HttpStatus.NO_CONTENT)
  async suspendUser(
    @CurrentUser() admin: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.adminService.suspendUser(admin.id, id);
  }

  @Post('users/:id/reactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reactivateUser(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.adminService.reactivateUser(id);
  }

  @Get('appointments')
  listAppointments(@Query() rawQuery: unknown) {
    const query = AdminAppointmentsQuerySchema.parse(rawQuery);
    return this.adminService.listAppointments(query);
  }
}
