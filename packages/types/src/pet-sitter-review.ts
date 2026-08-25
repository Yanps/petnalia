import { z } from 'zod';

export const PetSitterReviewSchema = z.object({
  id: z.string().uuid(),
  bookingId: z.string().uuid(),
  authorId: z.string().uuid(),
  petSitterId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  text: z.string().max(1000).nullable(),
  publishedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});
export type PetSitterReview = z.infer<typeof PetSitterReviewSchema>;

export const CreatePetSitterReviewInputSchema = z.object({
  bookingId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  text: z.string().max(1000).optional(),
});
export type CreatePetSitterReviewInput = z.infer<typeof CreatePetSitterReviewInputSchema>;
