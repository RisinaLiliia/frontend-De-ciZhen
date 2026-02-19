// src/features/auth/register.schema.ts
import { z } from 'zod';
import type { I18nKey } from '@/lib/i18n/keys';

type Translate = (key: I18nKey) => string;

export function buildRegisterSchema(t: Translate) {
  return z
    .object({
      name: z
        .string()
        .trim()
        .min(1, t('auth.errorNameRequired'))
        .min(2, t('auth.errorNameMin')),
      email: z
        .string()
        .trim()
        .min(1, t('auth.errorEmailRequired'))
        .email(t('auth.errorEmailInvalid')),
      password: z
        .string()
        .min(1, t('auth.errorPasswordRequired'))
        .min(8, t('auth.errorPasswordMin'))
        .regex(/[A-ZА-ЯЁ]/, t('auth.passwordRuleUpper'))
        .regex(/[a-zа-яё]/, t('auth.passwordRuleLower'))
        .regex(/\d/, t('auth.passwordRuleDigit'))
        .regex(/[^A-Za-zА-Яа-яЁё0-9]/, t('auth.passwordRuleSymbol')),
      confirmPassword: z
        .string()
        .min(1, t('auth.errorConfirmPasswordRequired')),
      acceptPrivacyPolicy: z
        .boolean()
        .refine((v) => v === true, t('auth.errorAcceptPolicyRequired')),
    })
    .refine((values) => values.password === values.confirmPassword, {
      path: ['confirmPassword'],
      message: t('auth.errorConfirmPasswordMismatch'),
    });
}

export type RegisterValues = z.infer<ReturnType<typeof buildRegisterSchema>>;
