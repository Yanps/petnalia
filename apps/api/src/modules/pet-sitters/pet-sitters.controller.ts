import { Body, Controller, Get, HttpCode, HttpStatus, Put, Query } from '@nestjs/common';
import { PetSitterSearchQuerySchema, UpdatePetSitterProfileInputSchema } from '@petnalia/types';
import type { User } from '@prisma/client';

import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Public } from '../../shared/decorators/public.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { PetSittersService } from './pet-sitters.service';

@Controller('pet-sitters')
export class PetSittersController {
  constructor(private readonly petSittersService: PetSittersService) {}

  @Public()
  @Get('search')
  search(@Query() rawQuery: unknown) {
    const query = PetSitterSearchQuerySchema.parse(rawQuery);
    return this.petSittersService.search(query);
  }

  @Get('me')
  @Roles('pet_sitter')
  getOwnProfile(@CurrentUser() user: User) {
    return this.petSittersService.getOwnProfile(user.id);
  }

  @Put('me')
  @Roles('pet_sitter')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateOwnProfile(@CurrentUser() user: User, @Body() body: unknown): Promise<void> {
    const dto = UpdatePetSitterProfileInputSchema.parse(body);
    await this.petSittersService.updateOwnProfile(user.id, dto);
  }
}
