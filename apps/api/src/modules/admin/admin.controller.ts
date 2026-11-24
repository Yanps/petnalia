import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import type { User } from '@prisma/client';

import {
  AdminAppointmentsQuerySchema,
  ModerationDecisionInputSchema,
  PaginationQuerySchema,
  RejectVetInputSchema,
} from '@petnalia/types';

import { AdminService } from './admin.service';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UuidParamPipe } from '../../shared/pipes/uuid-param.pipe';


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
  async approveVet(@Param('id', UuidParamPipe) id: string): Promise<void> {
    await this.adminService.approveVet(id);
  }

  @Post('veterinarians/:id/reject')
  @HttpCode(HttpStatus.NO_CONTENT)
  async rejectVet(
    @Param('id', UuidParamPipe) id: string,
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
    @Param('id', UuidParamPipe) id: string,
  ): Promise<void> {
    await this.adminService.suspendUser(admin.id, id);
  }

  @Post('users/:id/reactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reactivateUser(@Param('id', UuidParamPipe) id: string): Promise<void> {
    await this.adminService.reactivateUser(id);
  }

  @Get('appointments')
  listAppointments(@Query() rawQuery: unknown) {
    const query = AdminAppointmentsQuerySchema.parse(rawQuery);
    return this.adminService.listAppointments(query);
  }

  @Get('pet-sitters/flagged')
  listFlaggedPetSitters(@Query() rawQuery: unknown) {
    const query = PaginationQuerySchema.parse(rawQuery);
    return this.adminService.listFlaggedPetSitters(query.page, query.limit);
  }

  @Get('pet-sitters/reviewed')
  listReviewedPetSitters(@Query() rawQuery: unknown) {
    const query = PaginationQuerySchema.parse(rawQuery);
    return this.adminService.listReviewedPetSitters(query.page, query.limit);
  }

  @Post('pet-sitters/:id/confirm-violation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmPetSitterViolation(
    @Param('id', UuidParamPipe) id: string,
    @Body() body: unknown,
  ): Promise<void> {
    const dto = ModerationDecisionInputSchema.parse(body ?? {});
    await this.adminService.confirmPetSitterViolation(id, dto.moderatorNote);
  }

  @Post('pet-sitters/:id/dismiss')
  @HttpCode(HttpStatus.NO_CONTENT)
  async dismissPetSitterFlag(
    @Param('id', UuidParamPipe) id: string,
    @Body() body: unknown,
  ): Promise<void> {
    const dto = ModerationDecisionInputSchema.parse(body ?? {});
    await this.adminService.dismissPetSitterFlag(id, dto.moderatorNote);
  }
}
