import { Injectable } from '@nestjs/common';
import type { CreatePetInput } from '@petnalia/types';

import { PrismaService } from '../../shared/prisma/prisma.service';

type PetCreateData = Omit<CreatePetInput, 'birthdate' | 'neutered'> & {
  birthdate: Date | null;
  neutered: boolean;
};

@Injectable()
export class PetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByOwner(ownerId: string) {
    return this.prisma.pet.findMany({
      where: { ownerId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: string, ownerId: string) {
    return this.prisma.pet.findFirst({
      where: { id, ownerId, deletedAt: null },
    });
  }

  async create(ownerId: string, data: PetCreateData) {
    return this.prisma.pet.create({
      data: {
        ownerId,
        name: data.name,
        species: data.species,
        sex: data.sex as 'male' | 'female',
        neutered: data.neutered,
        breed: data.breed,
        birthdate: data.birthdate,
        weightKg: data.weightKg,
        microchip: data.microchip,
        photoUrl: data.photoUrl,
      },
    });
  }

  async softDelete(id: string, ownerId: string) {
    return this.prisma.pet.updateMany({
      where: { id, ownerId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}
