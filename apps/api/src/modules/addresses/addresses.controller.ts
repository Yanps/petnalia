import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { User } from '@prisma/client';
import { CreateAddressInputSchema } from '@petnalia/types';

import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { AddressesService } from './addresses.service';

@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  list(@CurrentUser() user: User) {
    return this.addressesService.listAddresses(user.id);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() body: unknown) {
    const dto = CreateAddressInputSchema.parse(body);
    return this.addressesService.createAddress(user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.addressesService.deleteAddress(id, user.id);
  }
}
