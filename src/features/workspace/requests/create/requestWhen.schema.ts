// src/features/request/when.schema.ts
import { z } from 'zod';

export const scheduleSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('once'),
    date: z.string().min(1),
  }),
  z.object({
    mode: z.literal('recurring'),
    frequency: z.enum(['weekly', 'biweekly']),
    timesPerWeek: z.enum(['1', '2', '3']),
    weekdays: z.array(z.enum(['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'])).min(1),
    startDate: z.string().min(1),
  }),
]);

export type Schedule = z.infer<typeof scheduleSchema>;
