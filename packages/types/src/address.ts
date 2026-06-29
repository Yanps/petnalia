import { z } from 'zod';

export const AddressSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  label: z.string().nullable(),
  street: z.string(),
  number: z.string(),
  complement: z.string().nullable(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string().length(2),
  cep: z.string(),
  createdAt: z.string().datetime(),
});
export type Address = z.infer<typeof AddressSchema>;

export const CreateAddressInputSchema = z.object({
  label: z.string().max(50).optional(),
  street: z.string().min(1).max(200),
  number: z.string().min(1).max(20),
  complement: z.string().max(100).optional(),
  neighborhood: z.string().min(1).max(100),
  city: z.string().min(1).max(100),
  state: z.string().length(2),
  cep: z.string().regex(/^\d{8}$/, 'CEP deve ter 8 dígitos sem hífen'),
});
export type CreateAddressInput = z.infer<typeof CreateAddressInputSchema>;
