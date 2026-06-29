import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { User } from '@prisma/client';
import { AvailabilityQuerySchema, CreateSlotsInputSchema } from '@petnalia/types';

import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Public } from '../../shared/decorators/public.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { AvailabilityService } from './availability.service';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Public()
  @Get()
  getOpenSlots(@Query() rawQuery: unknown) {
    const query = AvailabilityQuerySchema.parse(rawQuery);
    return this.availabilityService.getOpenSlots(query);
  }

  @Post('slots')
  @Roles('veterinarian')
  createSlots(@CurrentUser() user: User, @Body() body: unknown) {
    const dto = CreateSlotsInputSchema.parse(body);
    return this.availabilityService.createSlots(user.id, dto);
  }

  @Post('slots/:id/hold')
  @Roles('tutor')
  holdSlot(@Param('id') slotId: string) {
    return this.availabilityService.holdSlot(slotId);
  }
}
