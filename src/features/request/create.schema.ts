// src/features/request/create.schema.ts
import { z } from 'zod';
import type { I18nKey } from '@/lib/i18n/keys';

type Translate = (key: I18nKey) => string;

export function buildCreateRequestSchema(t: Translate) {
  return z.object({
    title: z
      .string()
      .trim()
      .min(3, t('request.errorTitleRequired'))
      .max(120, t('request.errorTitleMax')),
    serviceKey: z.string().min(1, t('request.errorServiceRequired')),
    cityId: z.string().min(1, t('request.errorCityRequired')),
    propertyType: z.enum(['apartment', 'house']),
    area: z.number().min(10, t('request.errorAreaMin')),
    price: z.number().min(1, t('request.errorPriceMin')).optional(),
    preferredDate: z.string().min(1, t('request.errorDateRequired')),
    isRecurring: z.boolean(),
    description: z.string().max(2000, t('request.errorDescriptionMax')).optional(),
    photos: z.array(z.string().url()).optional(),
    tags: z.array(z.string().min(1)).optional(),
  });
}

export type CreateRequestValues = z.infer<ReturnType<typeof buildCreateRequestSchema>>;
