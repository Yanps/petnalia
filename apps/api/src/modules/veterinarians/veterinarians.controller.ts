import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { UpdateVetProfileInputSchema, VetSearchQuerySchema } from '@petnalia/types';

import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Public } from '../../shared/decorators/public.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { VeterinariansService } from './veterinarians.service';

@Controller('veterinarians')
export class VeterinariansController {
  constructor(private readonly vetsService: VeterinariansService) {}

  @Public()
  @Get('search')
  search(@Query() rawQuery: unknown) {
    const query = VetSearchQuerySchema.parse(rawQuery);
    return this.vetsService.search(query);
  }

  @Public()
  @Get('specialties')
  listSpecialties() {
    return this.vetsService.listSpecialties();
  }

  @Get('me')
  @Roles('veterinarian')
  getOwnProfile(@CurrentUser() user: User) {
    return this.vetsService.getOwnProfile(user.id);
  }

  @Put('profile')
  @Roles('veterinarian')
  async updateProfile(@CurrentUser() user: User, @Body() body: unknown) {
    const dto = UpdateVetProfileInputSchema.parse(body);
    await this.vetsService.updateOwnProfile(user.id, dto);
  }

  @Post('crmv-photo')
  @Roles('veterinarian')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async uploadCrmvPhoto(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.vetsService.uploadCrmvPhoto(user.id, {
      buffer: file.buffer,
      mimetype: file.mimetype,
      size: file.size,
      originalname: file.originalname,
    });
  }

  @Public()
  @Get(':slug')
  getProfile(@Param('slug') slug: string) {
    return this.vetsService.getProfile(slug);
  }
}
