// src/features/auth/login.schema.ts
import { z } from 'zod';
import type { I18nKey } from '@/lib/i18n/keys';

type Translate = (key: I18nKey) => string;

export function buildLoginSchema(t: Translate) {
  return z.object({
    email: z
      .string()
      .trim()
      .min(1, t('auth.errorEmailRequired'))
      .email(t('auth.errorEmailInvalid')),
    password: z
      .string()
      .min(1, t('auth.errorPasswordRequired'))
      .min(8, t('auth.errorPasswordMin')),
  });
}

export type LoginValues = z.infer<ReturnType<typeof buildLoginSchema>>;
