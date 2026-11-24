import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import type { User } from '@prisma/client';

import { UpdateProfileInputSchema } from '@petnalia/types';

import { UsersService } from './users.service';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: User) {
    return this.usersService.getMe(user.id);
  }

  @Patch('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateMe(@CurrentUser() user: User, @Body() body: unknown): Promise<void> {
    const dto = UpdateProfileInputSchema.parse(body);
    await this.usersService.updateMe(user.id, dto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMe(@CurrentUser() user: User): Promise<void> {
    await this.usersService.deleteMe(user.id);
  }
}
