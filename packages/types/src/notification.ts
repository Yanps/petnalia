import { z } from 'zod';

import { NotificationChannelSchema, PaginatedResponseSchema } from './common.js';

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.string(),
  channel: NotificationChannelSchema,
  payload: z.record(z.string(), z.unknown()),
  readAt: z.string().datetime().nullable(),
  sentAt: z.string().datetime().nullable(),
  status: z.enum(['pending', 'sent', 'failed']),
  createdAt: z.string().datetime(),
});
export type Notification = z.infer<typeof NotificationSchema>;

export const NotificationListResponseSchema = PaginatedResponseSchema(NotificationSchema);
export type NotificationListResponse = z.infer<typeof NotificationListResponseSchema>;
