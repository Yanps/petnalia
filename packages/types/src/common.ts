import { z } from 'zod';

// ── Enums ─────────────────────────────────────────────────────────────────────

export const RoleSchema = z.enum(['tutor', 'veterinarian', 'admin']);
export type Role = z.infer<typeof RoleSchema>;

export const AppointmentStatusSchema = z.enum([
  'requested',
  'confirmed',
  'pending',
  'completed',
  'cancelled',
]);
export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>;

export const ModalitySchema = z.enum(['home', 'online']);
export type Modality = z.infer<typeof ModalitySchema>;

export const VerificationStatusSchema = z.enum([
  'pending',
  'in_review',
  'verified',
  'rejected',
]);
export type VerificationStatus = z.infer<typeof VerificationStatusSchema>;

export const VetTierSchema = z.enum(['free', 'premium']);
export type VetTier = z.infer<typeof VetTierSchema>;

export const SlotStatusSchema = z.enum(['open', 'held', 'booked', 'blocked']);
export type SlotStatus = z.infer<typeof SlotStatusSchema>;

export const SubscriptionStatusSchema = z.enum([
  'active',
  'past_due',
  'cancelled',
  'trialing',
]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;

export const NotificationChannelSchema = z.enum(['email', 'whatsapp', 'push']);
export type NotificationChannel = z.infer<typeof NotificationChannelSchema>;

export const PetSexSchema = z.enum(['male', 'female', 'unknown']);
export type PetSex = z.infer<typeof PetSexSchema>;

// ── Pagination ────────────────────────────────────────────────────────────────

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  });
export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ── Error envelope ────────────────────────────────────────────────────────────

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

// ── Geo ───────────────────────────────────────────────────────────────────────

export const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
export type Coordinates = z.infer<typeof CoordinatesSchema>;
