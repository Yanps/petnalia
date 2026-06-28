import { Controller } from '@nestjs/common';

import { AvailabilityService } from './availability.service';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  // TODO: GET /availability?vetId=&from=&to=
  // TODO: POST /availability/slots (vet only)
  // TODO: POST /availability/slots/:id/hold
}
