// src/features/request/create.schema.ts
import { z } from 'zod';

export const createRequestSchema = z.object({
  title: z.string().min(3, 'Title is required').max(120, 'Max 120 characters'),
  serviceKey: z.string().min(1, 'Service is required'),
  cityId: z.string().min(1, 'City is required'),
  propertyType: z.enum(['apartment', 'house']),
  area: z.number().min(10, 'Area must be at least 10 m²'),
  price: z.number().min(1).optional(),
  preferredDate: z.string().min(1, 'Date is required'),
  isRecurring: z.boolean(),
  description: z.string().max(2000).optional(),
  photos: z.array(z.string().url()).optional(),
  tags: z.array(z.string().min(1)).optional(),
});

export type CreateRequestValues = z.infer<typeof createRequestSchema>;
