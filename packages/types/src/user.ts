import { z } from 'zod';
import { zCpf } from '@petnalia/validation';

import { RoleSchema } from './common.js';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: RoleSchema,
  emailVerifiedAt: z.string().datetime().nullable(),
  status: z.enum(['active', 'suspended', 'deleted']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type User = z.infer<typeof UserSchema>;

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  fullName: z.string().min(2).max(120),
  phone: z.string().optional(),
  avatarUrl: z.string().url().nullable(),
  cpf: zCpf().optional(),
  locale: z.string().default('pt-BR'),
});
export type Profile = z.infer<typeof ProfileSchema>;

// ── Request / Response DTOs ───────────────────────────────────────────────────

export const RegisterInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  fullName: z.string().min(2).max(120),
  role: RoleSchema.extract(['tutor', 'veterinarian']),
});
export type RegisterInput = z.infer<typeof RegisterInputSchema>;

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  expiresIn: z.number(),
});
export type AuthTokens = z.infer<typeof AuthTokensSchema>;

export const UpdateProfileInputSchema = ProfileSchema.pick({
  fullName: true,
  phone: true,
  avatarUrl: true,
  cpf: true,
}).partial();
export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;
