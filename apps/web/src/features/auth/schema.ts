import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});
export type LoginData = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  name:     z.string().min(2, 'Nome muito curto'),
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  role:     z.enum(['TUTOR', 'VETERINARIAN']),
});
export type RegisterData = z.infer<typeof RegisterSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
});
export type ForgotPasswordData = z.infer<typeof ForgotPasswordSchema>;
