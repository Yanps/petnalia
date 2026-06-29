import { z } from 'zod';
import { zCrmv, zPhoneBR } from '@petnalia/validation';

import { VerificationStatusSchema, VetTierSchema, CoordinatesSchema } from './common.js';

export const SpecialtySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
});
export type Specialty = z.infer<typeof SpecialtySchema>;

export const VeterinarianSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  crmv: z.string(),
  crmvState: z.string().length(2),
  bio: z.string().max(1000).nullable(),
  verificationStatus: VerificationStatusSchema,
  tier: VetTierSchema,
  serviceRadiusKm: z.number().positive().max(200),
  specialties: z.array(SpecialtySchema),
  averageRating: z.number().min(0).max(5).nullable(),
  totalReviews: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Veterinarian = z.infer<typeof VeterinarianSchema>;

export const VetProfileSchema = VeterinarianSchema.extend({
  fullName: z.string(),
  avatarUrl: z.string().url().nullable(),
  slug: z.string(),
  baseCoordinates: CoordinatesSchema.nullable(),
});
export type VetProfile = z.infer<typeof VetProfileSchema>;

// ── Request / Response DTOs ───────────────────────────────────────────────────

export const CreateVetProfileInputSchema = z.object({
  crmv: zCrmv(),
  bio: z.string().max(1000).optional(),
  serviceRadiusKm: z.number().positive().max(200).default(20),
  phone: zPhoneBR().optional(),
  specialtyIds: z.array(z.string().uuid()).min(1),
});
export type CreateVetProfileInput = z.infer<typeof CreateVetProfileInputSchema>;

export const VetSearchQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().positive().max(200).default(20),
  specialtyId: z.string().uuid().optional(),
  modality: z.enum(['home', 'online', 'any']).default('any'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});
export type VetSearchQuery = z.infer<typeof VetSearchQuerySchema>;

export const VetSearchResultSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  fullName: z.string(),
  avatarUrl: z.string().url().nullable(),
  bio: z.string().nullable(),
  specialties: z.array(SpecialtySchema),
  averageRating: z.number().min(0).max(5),
  totalReviews: z.number().int().nonnegative(),
  distanceKm: z.number().nonnegative(),
  baseCity: z.string(),
  baseState: z.string().length(2),
  serviceRadiusKm: z.number().positive(),
  verificationStatus: VerificationStatusSchema,
  tier: VetTierSchema,
});
export type VetSearchResult = z.infer<typeof VetSearchResultSchema>;

export const VetSearchResponseSchema = z.object({
  data: z.array(VetSearchResultSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  hasMore: z.boolean(),
});
export type VetSearchResponse = z.infer<typeof VetSearchResponseSchema>;
