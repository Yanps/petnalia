import { z } from 'zod';
import { PaginatedResponseSchema } from './common.js';

export const PetSitterServiceSchema = z.enum([
  'hospedagem',
  'passeio',
  'day_care',
  'visita_domiciliar',
]);
export type PetSitterService = z.infer<typeof PetSitterServiceSchema>;

export const PET_SITTER_SERVICE_LABELS: Record<PetSitterService, string> = {
  hospedagem: 'Hospedagem',
  passeio: 'Passeio',
  day_care: 'Day care',
  visita_domiciliar: 'Visita domiciliar',
};

const zStringArray = z.preprocess(
  (v) => (v === undefined ? undefined : Array.isArray(v) ? v : [v]),
  z.array(z.string()).optional(),
);

export const PetSitterSearchQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().positive().max(200).default(20),
  services: zStringArray,
  q: z.string().trim().min(1).max(120).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});
export type PetSitterSearchQuery = z.infer<typeof PetSitterSearchQuerySchema>;

export const PetSitterSearchResultSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  fullName: z.string(),
  avatarUrl: z.string().nullable(),
  bio: z.string().nullable(),
  services: z.array(PetSitterServiceSchema),
  distanceKm: z.number(),
  baseCity: z.string(),
  baseState: z.string(),
  averageRating: z.number().min(0).max(5),
  totalReviews: z.number().int().nonnegative(),
});
export type PetSitterSearchResult = z.infer<typeof PetSitterSearchResultSchema>;

export const PetSitterSearchResponseSchema = z.object({
  data: z.array(PetSitterSearchResultSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  hasMore: z.boolean(),
});
export type PetSitterSearchResponse = z.infer<typeof PetSitterSearchResponseSchema>;

// ── Account & self-service profile ──────────────────────────────────────────

export const RegisterPetSitterInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  fullName: z.string().min(2).max(120),
});
export type RegisterPetSitterInput = z.infer<typeof RegisterPetSitterInputSchema>;

export const UpdatePetSitterProfileInputSchema = z.object({
  bio: z.string().max(1000).optional(),
  services: z.array(PetSitterServiceSchema).optional(),
  baseCity: z.string().min(1).max(120).optional(),
  baseState: z.string().length(2).optional(),
});
export type UpdatePetSitterProfileInput = z.infer<typeof UpdatePetSitterProfileInputSchema>;

export const PetSitterOwnProfileResponseSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string(),
  bio: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  services: z.array(PetSitterServiceSchema),
  baseCity: z.string().nullable(),
  baseState: z.string().nullable(),
});
export type PetSitterOwnProfileResponse = z.infer<typeof PetSitterOwnProfileResponseSchema>;

export const PetSitterProfilePublicResponseSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  fullName: z.string(),
  bio: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  services: z.array(PetSitterServiceSchema),
  baseCity: z.string(),
  baseState: z.string(),
  averageRating: z.number().min(0).max(5),
  totalReviews: z.number().int().nonnegative(),
});
export type PetSitterProfilePublicResponse = z.infer<typeof PetSitterProfilePublicResponseSchema>;

// ── Content moderation (admin) ───────────────────────────────────────────────
// Bios are scanned for veterinary/medical-service keywords (services themselves
// are a closed enum with no medical option, so the bio free-text is the only
// place that abuse pattern can appear). Flagging never blocks the sitter's own
// save and is invisible to them — only a confirmed violation triggers a
// notification to the sitter; see apps/api/src/modules/pet-sitters/bio-moderation.ts.

export const PetSitterModerationStatusSchema = z.enum([
  'clean',
  'flagged',
  'confirmed_violation',
  'dismissed',
]);
export type PetSitterModerationStatus = z.infer<typeof PetSitterModerationStatusSchema>;

export const FlaggedPetSitterItemSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string(),
  bio: z.string().nullable(),
  flagReason: z.string().nullable(),
  violationCount: z.number().int().nonnegative(),
  updatedAt: z.string().datetime(),
});
export type FlaggedPetSitterItem = z.infer<typeof FlaggedPetSitterItemSchema>;

export const FlaggedPetSitterListResponseSchema = PaginatedResponseSchema(FlaggedPetSitterItemSchema);
export type FlaggedPetSitterListResponse = z.infer<typeof FlaggedPetSitterListResponseSchema>;

export const ReviewedPetSitterItemSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string(),
  moderationStatus: PetSitterModerationStatusSchema,
  flagReason: z.string().nullable(),
  moderatorNote: z.string().nullable(),
  violationCount: z.number().int().nonnegative(),
  updatedAt: z.string().datetime(),
});
export type ReviewedPetSitterItem = z.infer<typeof ReviewedPetSitterItemSchema>;

export const ReviewedPetSitterListResponseSchema = PaginatedResponseSchema(ReviewedPetSitterItemSchema);
export type ReviewedPetSitterListResponse = z.infer<typeof ReviewedPetSitterListResponseSchema>;

export const ModerationDecisionInputSchema = z.object({
  moderatorNote: z.string().max(500).optional(),
});
export type ModerationDecisionInput = z.infer<typeof ModerationDecisionInputSchema>;
