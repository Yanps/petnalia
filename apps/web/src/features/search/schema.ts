import { z } from 'zod';

export const SearchParamsSchema = z.object({
  q:            z.string().optional(),
  cidade:       z.string().optional(),
  especialidade: z.string().optional(),
  raio:         z.coerce.number().min(1).max(100).default(10),
  pagina:       z.coerce.number().min(1).default(1),
});

export type SearchParams = z.infer<typeof SearchParamsSchema>;
