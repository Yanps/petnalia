import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CreatePetInputSchema } from '@petnalia/types';
import type { User } from '@prisma/client';

import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { PetsService } from './pets.service';

@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Get()
  @Roles('tutor')
  list(@CurrentUser() user: User) {
    return this.petsService.listMyPets(user.id);
  }

  @Post()
  @Roles('tutor')
  create(@CurrentUser() user: User, @Body() body: unknown) {
    const dto = CreatePetInputSchema.parse(body);
    return this.petsService.createPet(user.id, dto);
  }

  @Delete(':id')
  @Roles('tutor')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    await this.petsService.deletePet(id, user.id);
  }
}
