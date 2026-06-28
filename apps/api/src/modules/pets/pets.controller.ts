import { Controller } from '@nestjs/common';

import { PetsService } from './pets.service';

@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  // TODO: GET /pets
  // TODO: POST /pets
  // TODO: GET /pets/:id
  // TODO: PATCH /pets/:id
  // TODO: DELETE /pets/:id
}
