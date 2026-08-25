import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { User } from '@prisma/client';
import { CreatePetSitterSlotsInputSchema, PetSitterAvailabilityQuerySchema } from '@petnalia/types';

import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Public } from '../../shared/decorators/public.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { PetSitterAvailabilityService } from './pet-sitter-availability.service';

@Controller('pet-sitter-availability')
export class PetSitterAvailabilityController {
  constructor(private readonly availabilityService: PetSitterAvailabilityService) {}

  @Public()
  @Get()
  getOpenSlots(@Query() rawQuery: unknown) {
    const query = PetSitterAvailabilityQuerySchema.parse(rawQuery);
    return this.availabilityService.getOpenSlots(query);
  }

  @Post('slots')
  @Roles('pet_sitter')
  createSlots(@CurrentUser() user: User, @Body() body: unknown) {
    const dto = CreatePetSitterSlotsInputSchema.parse(body);
    return this.availabilityService.createSlotsForUser(user.id, dto);
  }

  @Post('slots/:id/hold')
  @Roles('tutor')
  holdSlot(@Param('id') slotId: string) {
    return this.availabilityService.holdSlot(slotId);
  }
}
