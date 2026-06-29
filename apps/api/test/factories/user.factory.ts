import type { RegisterInput } from '@petnalia/types';

let seq = 0;

export function makeRegisterInput(overrides: Partial<RegisterInput> = {}): RegisterInput {
  seq++;
  return {
    email: `tutor${seq}@petnalia.test`,
    password: 'Senha@12345',
    fullName: `Usuário Teste ${seq}`,
    role: 'tutor',
    ...overrides,
  };
}
