import { Injectable } from '@nestjs/common';

import { VeterinariansRepository } from './veterinarians.repository';

@Injectable()
export class VeterinariansService {
  constructor(private readonly vetsRepository: VeterinariansRepository) {}

  // TODO: getProfile(vetId)
  // TODO: createProfile(userId, dto)
  // TODO: updateProfile(vetId, dto)
  // TODO: submitForVerification(vetId)
  // TODO: listSpecialties()
}
