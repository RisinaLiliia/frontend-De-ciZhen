// src/features/auth/register.schema.ts
import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['client', 'provider']).optional(),
  city: z.string().optional(),
  language: z.string().optional(),
  acceptPrivacyPolicy: z
    .boolean()
    .refine((v) => v === true, 'Please accept the privacy policy'),
});

export type RegisterValues = z.infer<typeof registerSchema>;
