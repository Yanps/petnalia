import { Injectable } from '@nestjs/common';
import type { CreatePetInput } from '@petnalia/types';

import { PetsRepository } from './pets.repository';

@Injectable()
export class PetsService {
  constructor(private readonly petsRepository: PetsRepository) {}

  listMyPets(tutorId: string) {
    return this.petsRepository.findByOwner(tutorId);
  }

  createPet(tutorId: string, dto: CreatePetInput) {
    return this.petsRepository.create(tutorId, {
      name: dto.name,
      species: dto.species,
      sex: dto.sex,
      neutered: dto.neutered ?? false,
      breed: dto.breed ?? null,
      birthdate: dto.birthdate ? new Date(dto.birthdate) : null,
      weightKg: dto.weightKg ?? null,
      microchip: dto.microchip ?? null,
      photoUrl: dto.photoUrl ?? null,
    });
  }

  async deletePet(petId: string, tutorId: string) {
    await this.petsRepository.softDelete(petId, tutorId);
  }
}
