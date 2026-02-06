// src/features/request/create.schema.ts
import { z } from 'zod';

export const createRequestSchema = z.object({
  serviceKey: z.string().min(1, 'Service is required'),
  cityId: z.string().min(1, 'City is required'),
  propertyType: z.enum(['apartment', 'house']),
  area: z.number().min(10, 'Area must be at least 10 m²'),
  preferredDate: z.string().min(1, 'Date is required'),
  isRecurring: z.boolean(),
  comment: z.string().max(1000).optional(),
});

export type CreateRequestValues = z.infer<typeof createRequestSchema>;
