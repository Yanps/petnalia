import { z } from 'zod';

export const ReviewSchema = z.object({
  id: z.string().uuid(),
  appointmentId: z.string().uuid(),
  authorId: z.string().uuid(),
  veterinarianId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  text: z.string().max(1000).nullable(),
  publishedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});
export type Review = z.infer<typeof ReviewSchema>;

export const CreateReviewInputSchema = z.object({
  appointmentId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  text: z.string().max(1000).optional(),
});
export type CreateReviewInput = z.infer<typeof CreateReviewInputSchema>;
