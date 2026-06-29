import type { Pet } from '@petnalia/types';

import { apiFetch } from '@/lib/api-client';
import { getToken } from '@/lib/auth';
import { PetsList } from '@/components/dashboard/pets-list';

export const metadata = { title: 'Meus pets — PetNalia' };

export default async function PetsPage() {
  const token = await getToken();

  const pets = await apiFetch<Pet[]>('/v1/pets', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).catch(() => []);

  return <PetsList initialPets={pets} token={token ?? ''} />;
}
