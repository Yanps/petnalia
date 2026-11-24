'use server';

import { SearchParamsSchema } from './schema';

// eslint-disable-next-line @typescript-eslint/require-await -- Server Actions must be async functions.
export async function searchVetsAction(formData: FormData) {
  // Server Action: orchestrates call to the API; business logic stays in NestJS
  const params = SearchParamsSchema.parse({
    q:            formData.get('q'),
    cidade:       formData.get('cidade'),
    especialidade: formData.get('especialidade'),
    raio:         formData.get('raio'),
  });

  // TODO: call api.get('/v1/veterinarians/search', { ... params ... })
  return { params };
}
