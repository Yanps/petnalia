import { Injectable } from '@nestjs/common';

import { PetsRepository } from './pets.repository';

@Injectable()
export class PetsService {
  constructor(private readonly petsRepository: PetsRepository) {}

  // TODO: listMyPets(tutorId)
  // TODO: createPet(tutorId, dto)
  // TODO: updatePet(petId, tutorId, dto)
  // TODO: deletePet(petId, tutorId)
}
