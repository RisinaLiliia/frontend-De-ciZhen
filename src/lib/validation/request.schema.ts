// src/lib/validation/request.schema.ts
import { z } from "zod";

export const requestSchema = z.object({
  service: z.string().min(1),
  city: z.string().min(2),
  date: z.string(),
  comment: z.string().optional(),
});

export type RequestForm = z.infer<typeof requestSchema>;
