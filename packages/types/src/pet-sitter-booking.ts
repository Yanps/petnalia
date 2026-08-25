import { z } from 'zod';

import { PaginatedResponseSchema, PaginationQuerySchema } from './common.js';
import { PetSitterServiceSchema } from './pet-sitter.js';

export const PetSitterBookingStatusSchema = z.enum([
  'requested',
  'confirmed',
  'completed',
  'cancelled',
]);
export type PetSitterBookingStatus = z.infer<typeof PetSitterBookingStatusSchema>;

// No priceCents: pet sitter bookings stay free while the platform has no
// billing model for this role.
export const PetSitterBookingSchema = z.object({
  id: z.string().uuid(),
  tutorId: z.string().uuid(),
  petSitterId: z.string().uuid(),
  petId: z.string().uuid(),
  addressId: z.string().uuid().nullable(),
  slotId: z.string().uuid(),
  service: PetSitterServiceSchema,
  status: PetSitterBookingStatusSchema,
  notes: z.string().max(500).nullable(),
  scheduledAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type PetSitterBooking = z.infer<typeof PetSitterBookingSchema>;

// addressId is only required for services that bring the sitter to the
// tutor ("passeio", "visita_domiciliar") — "hospedagem"/"day_care" have the
// pet go to the sitter instead, so it stays optional at the schema level.
export const CreatePetSitterBookingInputSchema = z.object({
  petSitterId: z.string().uuid(),
  petId: z.string().uuid(),
  addressId: z.string().uuid().optional(),
  slotId: z.string().uuid(),
  holdToken: z.string().min(1),
  service: PetSitterServiceSchema,
  notes: z.string().max(500).optional(),
});
export type CreatePetSitterBookingInput = z.infer<typeof CreatePetSitterBookingInputSchema>;

export const CancelPetSitterBookingInputSchema = z.object({
  reason: z.string().max(200).optional(),
});
export type CancelPetSitterBookingInput = z.infer<typeof CancelPetSitterBookingInputSchema>;

export const PetSitterBookingListItemSchema = z.object({
  id: z.string().uuid(),
  tutorName: z.string(),
  petSitterName: z.string(),
  petName: z.string(),
  service: PetSitterServiceSchema,
  status: PetSitterBookingStatusSchema,
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  createdAt: z.string().datetime(),
});
export type PetSitterBookingListItem = z.infer<typeof PetSitterBookingListItemSchema>;

export const PetSitterBookingListResponseSchema = PaginatedResponseSchema(PetSitterBookingListItemSchema);
export type PetSitterBookingListResponse = z.infer<typeof PetSitterBookingListResponseSchema>;

export const PetSitterBookingsQuerySchema = PaginationQuerySchema.extend({
  status: PetSitterBookingStatusSchema.optional(),
});
export type PetSitterBookingsQuery = z.infer<typeof PetSitterBookingsQuerySchema>;
