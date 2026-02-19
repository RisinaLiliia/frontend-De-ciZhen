import { z } from 'zod';
import type { I18nKey } from '@/lib/i18n/keys';

type Translate = (key: I18nKey) => string;

export function buildResetPasswordSchema(t: Translate) {
  return z
    .object({
      password: z
        .string()
        .min(1, t('auth.errorPasswordRequired'))
        .min(8, t('auth.errorPasswordMin'))
        .max(64, t('auth.errorPasswordMin'))
        .regex(/[A-ZА-ЯЁ]/, t('auth.passwordRuleUpper'))
        .regex(/[a-zа-яё]/, t('auth.passwordRuleLower'))
        .regex(/\d/, t('auth.passwordRuleDigit'))
        .regex(/[^A-Za-zА-Яа-яЁё0-9]/, t('auth.passwordRuleSymbol')),
      confirmPassword: z.string().min(1, t('auth.errorConfirmPasswordRequired')),
    })
    .refine((values) => values.password === values.confirmPassword, {
      path: ['confirmPassword'],
      message: t('auth.errorConfirmPasswordMismatch'),
    });
}

export type ResetPasswordValues = z.infer<ReturnType<typeof buildResetPasswordSchema>>;
