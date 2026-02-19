import { z } from 'zod';
import type { I18nKey } from '@/lib/i18n/keys';

type Translate = (key: I18nKey) => string;

export function buildForgotPasswordSchema(t: Translate) {
  return z.object({
    email: z
      .string()
      .trim()
      .min(1, t('auth.errorEmailRequired'))
      .email(t('auth.errorEmailInvalid')),
  });
}

export type ForgotPasswordValues = z.infer<ReturnType<typeof buildForgotPasswordSchema>>;
