import { Controller } from '@nestjs/common';

import { VeterinariansService } from './veterinarians.service';

@Controller('veterinarians')
export class VeterinariansController {
  constructor(private readonly vetsService: VeterinariansService) {}

  // TODO: GET /veterinarians/:id
  // TODO: POST /veterinarians/profile
  // TODO: PATCH /veterinarians/profile
  // TODO: POST /veterinarians/profile/submit
}
