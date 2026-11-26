import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

import { Public } from '../decorators/public.decorator';

/** Liveness probe for load balancers and container orchestrators: `GET /v1/health`. */
@Controller('health')
export class HealthController {
  @Get()
  @Public()
  @SkipThrottle()
  check(): { readonly status: 'ok' } {
    return { status: 'ok' };
  }
}
