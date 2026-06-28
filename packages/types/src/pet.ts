import { z } from 'zod';

import { PetSexSchema } from './common.js';

export const PetSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().uuid(),
  name: z.string().min(1).max(60),
  species: z.enum(['dog', 'cat', 'bird', 'rabbit', 'other']),
  breed: z.string().max(80).nullable(),
  birthdate: z.string().date().nullable(),
  weightKg: z.number().positive().nullable(),
  sex: PetSexSchema,
  neutered: z.boolean().default(false),
  microchip: z.string().max(20).nullable(),
  photoUrl: z.string().url().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Pet = z.infer<typeof PetSchema>;

export const CreatePetInputSchema = PetSchema.omit({
  id: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
});
export type CreatePetInput = z.infer<typeof CreatePetInputSchema>;

export const UpdatePetInputSchema = CreatePetInputSchema.partial();
export type UpdatePetInput = z.infer<typeof UpdatePetInputSchema>;
