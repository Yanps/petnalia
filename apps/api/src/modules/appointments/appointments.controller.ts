import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { User } from '@prisma/client';
import { CancelAppointmentInputSchema, CreateAppointmentInputSchema } from '@petnalia/types';

import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { AppointmentsService } from './appointments.service';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Roles('tutor')
  book(
    @CurrentUser() user: User,
    @Body() body: unknown,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const dto = CreateAppointmentInputSchema.parse(body);
    return this.appointmentsService.bookAppointment(user.id, dto, idempotencyKey);
  }

  @Get()
  listMine(@CurrentUser() user: User) {
    const role = user.role === 'tutor' ? 'tutor' : 'veterinarian';
    return this.appointmentsService.listMyAppointments(user.id, role);
  }

  @Get(':id')
  getOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.appointmentsService.getAppointment(id, user.id);
  }

  @Post(':id/confirm')
  @Roles('veterinarian')
  confirm(@CurrentUser() user: User, @Param('id') id: string) {
    return this.appointmentsService.confirmAppointment(id, user.id);
  }

  @Post(':id/cancel')
  cancel(@CurrentUser() user: User, @Param('id') id: string, @Body() body: unknown) {
    CancelAppointmentInputSchema.parse(body);
    return this.appointmentsService.cancelAppointment(id, user.id);
  }

  @Post(':id/complete')
  @Roles('veterinarian')
  complete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.appointmentsService.completeAppointment(id, user.id);
  }
}
