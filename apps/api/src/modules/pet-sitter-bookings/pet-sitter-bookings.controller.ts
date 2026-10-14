import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { User } from '@prisma/client';

import { CancelPetSitterBookingInputSchema, CreatePetSitterBookingInputSchema } from '@petnalia/types';

import { PetSitterBookingsService } from './pet-sitter-bookings.service';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UuidParamPipe } from '../../shared/pipes/uuid-param.pipe';
import { RATE_LIMIT } from '../../shared/rate-limit/rate-limit';


@Controller('pet-sitter-bookings')
export class PetSitterBookingsController {
  constructor(private readonly bookingsService: PetSitterBookingsService) {}

  @Post()
  @Roles('tutor')
  @Throttle(RATE_LIMIT.BOOKING)
  book(
    @CurrentUser() user: User,
    @Body() body: unknown,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const dto = CreatePetSitterBookingInputSchema.parse(body);
    return this.bookingsService.bookSitterService(user.id, dto, idempotencyKey);
  }

  @Get()
  listMine(@CurrentUser() user: User) {
    const role = user.role === 'tutor' ? 'tutor' : 'pet_sitter';
    return this.bookingsService.listMyBookings(user.id, role);
  }

  @Get(':id')
  getOne(@CurrentUser() user: User, @Param('id', UuidParamPipe) id: string) {
    return this.bookingsService.getBooking(id, user.id);
  }

  @Post(':id/confirm')
  @Roles('pet_sitter')
  confirm(@CurrentUser() user: User, @Param('id', UuidParamPipe) id: string) {
    return this.bookingsService.confirmBooking(id, user.id);
  }

  @Post(':id/cancel')
  cancel(@CurrentUser() user: User, @Param('id', UuidParamPipe) id: string, @Body() body: unknown) {
    CancelPetSitterBookingInputSchema.parse(body);
    return this.bookingsService.cancelBooking(id, user.id);
  }

  @Post(':id/complete')
  @Roles('pet_sitter')
  complete(@CurrentUser() user: User, @Param('id', UuidParamPipe) id: string) {
    return this.bookingsService.completeBooking(id, user.id);
  }
}
