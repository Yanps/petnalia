import { z } from 'zod';

import { AppointmentStatusSchema, ModalitySchema } from './common.js';

export const AppointmentSchema = z.object({
  id: z.string().uuid(),
  tutorId: z.string().uuid(),
  veterinarianId: z.string().uuid(),
  petId: z.string().uuid(),
  addressId: z.string().uuid(),
  slotId: z.string().uuid(),
  modality: ModalitySchema,
  status: AppointmentStatusSchema,
  priceCents: z.number().int().nonnegative(),
  notes: z.string().max(500).nullable(),
  scheduledAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Appointment = z.infer<typeof AppointmentSchema>;

export const CreateAppointmentInputSchema = z.object({
  veterinarianId: z.string().uuid(),
  petId: z.string().uuid(),
  addressId: z.string().uuid(),
  slotId: z.string().uuid(),
  modality: ModalitySchema,
  notes: z.string().max(500).optional(),
});
export type CreateAppointmentInput = z.infer<typeof CreateAppointmentInputSchema>;

export const CancelAppointmentInputSchema = z.object({
  reason: z.string().max(200).optional(),
});
export type CancelAppointmentInput = z.infer<typeof CancelAppointmentInputSchema>;
