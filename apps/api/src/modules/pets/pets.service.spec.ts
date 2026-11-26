import type { Pet } from '@prisma/client';
import { describe, it, expect, vi } from 'vitest';

import type { CreatePetInput } from '@petnalia/types';

import { PetNotFoundError } from './pets.errors';
import type { PetsRepository } from './pets.repository';
import { PetsService } from './pets.service';

const TUTOR_ID = 'tutor-uuid-1';
const PET_ID = 'pet-uuid-1';

const basePet: Pet = {
  id: PET_ID,
  ownerId: TUTOR_ID,
  name: 'Rex',
  species: 'dog',
  sex: 'male',
  neutered: false,
  breed: null,
  birthdate: null,
  weightKg: null,
  microchip: null,
  photoUrl: null,
  deletedAt: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

function makeRepo(overrides: Partial<PetsRepository> = {}) {
  return {
    findByOwner: vi.fn().mockResolvedValue([basePet]),
    findById: vi.fn().mockResolvedValue(basePet),
    create: vi.fn().mockResolvedValue(basePet),
    softDelete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as PetsRepository;
}

describe('PetsService.listMyPets', () => {
  it('delega para o repositório com o tutorId correto', async () => {
    const repo = makeRepo();
    const result = await new PetsService(repo).listMyPets(TUTOR_ID);
    expect(repo.findByOwner).toHaveBeenCalledWith(TUTOR_ID);
    expect(result).toEqual([basePet]);
  });
});

describe('PetsService.createPet', () => {
  const minimalDto: CreatePetInput = {
    name: 'Mia',
    species: 'cat',
    sex: 'female',
    breed: null,
    birthdate: null,
    weightKg: null,
    neutered: false,
    microchip: null,
    photoUrl: null,
  };

  it('passa os campos obrigatórios ao repositório', async () => {
    const repo = makeRepo();
    await new PetsService(repo).createPet(TUTOR_ID, minimalDto);
    expect(repo.create).toHaveBeenCalledWith(TUTOR_ID, expect.objectContaining({
      name: 'Mia',
      species: 'cat',
      sex: 'female',
    }));
  });

  it('usa neutered=false como padrão quando não informado', async () => {
    const repo = makeRepo();
    await new PetsService(repo).createPet(TUTOR_ID, minimalDto);
    expect(repo.create).toHaveBeenCalledWith(TUTOR_ID, expect.objectContaining({ neutered: false }));
  });

  it('usa null para campos opcionais não informados', async () => {
    const repo = makeRepo();
    await new PetsService(repo).createPet(TUTOR_ID, minimalDto);
    expect(repo.create).toHaveBeenCalledWith(TUTOR_ID, expect.objectContaining({
      breed: null,
      birthdate: null,
      weightKg: null,
      microchip: null,
      photoUrl: null,
    }));
  });

  it('converte birthdate string para objeto Date', async () => {
    const repo = makeRepo();
    await new PetsService(repo).createPet(TUTOR_ID, { ...minimalDto, birthdate: '2023-06-15' });
    expect(repo.create).toHaveBeenCalledWith(TUTOR_ID, expect.objectContaining({
      birthdate: new Date('2023-06-15'),
    }));
  });

  it('passa campos opcionais quando fornecidos', async () => {
    const repo = makeRepo();
    await new PetsService(repo).createPet(TUTOR_ID, {
      ...minimalDto,
      neutered: true,
      breed: 'Persa',
      weightKg: 4.2,
      microchip: '956000012345678',
    });
    expect(repo.create).toHaveBeenCalledWith(TUTOR_ID, expect.objectContaining({
      neutered: true,
      breed: 'Persa',
      weightKg: 4.2,
      microchip: '956000012345678',
    }));
  });
});

describe('PetsService.deletePet', () => {
  it('delega para o repositório com petId e tutorId', async () => {
    const repo = makeRepo();
    await new PetsService(repo).deletePet(PET_ID, TUTOR_ID);
    expect(repo.softDelete).toHaveBeenCalledWith(PET_ID, TUTOR_ID);
  });
});

describe('PetsService.assertOwnedBy', () => {
  it('resolve quando o pet pertence ao tutor', async () => {
    const repo = makeRepo();
    await expect(new PetsService(repo).assertOwnedBy(PET_ID, TUTOR_ID)).resolves.toBeUndefined();
    expect(repo.findById).toHaveBeenCalledWith(PET_ID, TUTOR_ID);
  });

  it('lança PetNotFoundError quando o pet não pertence ao tutor', async () => {
    const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) });
    await expect(new PetsService(repo).assertOwnedBy(PET_ID, 'outro-tutor')).rejects.toThrow(
      PetNotFoundError,
    );
  });
});
