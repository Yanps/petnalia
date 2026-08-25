import { Controller, Get, Query } from '@nestjs/common';

import { Public } from '../../shared/decorators/public.decorator';
import { GeocoderService } from './geocoder.service';

@Controller('geo')
export class GeoController {
  constructor(private readonly geocoder: GeocoderService) {}

  @Public()
  @Get('suggest')
  suggest(@Query('q') q: unknown) {
    const query = typeof q === 'string' ? q : '';
    return this.geocoder.suggestPlaces(query);
  }
}
