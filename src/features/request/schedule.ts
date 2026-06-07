// src/features/request/schedule.ts
import { scheduleSchema, type Schedule } from './when.schema';

export function serializeSchedule(value: Schedule): string {
  const parsed = scheduleSchema.safeParse(value);
  if (!parsed.success) return '';
  return encodeURIComponent(JSON.stringify(parsed.data));
}

export function parseScheduleParam(value?: string): Schedule | null {
  if (!value) return null;
  try {
    const raw = JSON.parse(decodeURIComponent(value));
    const parsed = scheduleSchema.safeParse(raw);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
