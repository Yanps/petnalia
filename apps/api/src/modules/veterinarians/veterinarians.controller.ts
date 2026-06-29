import { Controller, Get, Param, Query } from '@nestjs/common';
import { VetSearchQuerySchema } from '@petnalia/types';

import { Public } from '../../shared/decorators/public.decorator';
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
  @Get(':slug')
  getProfile(@Param('slug') slug: string) {
    return this.vetsService.getProfile(slug);
  }
}
