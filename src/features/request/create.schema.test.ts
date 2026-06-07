import { describe, expect, it } from 'vitest';
import type { I18nKey } from '@/lib/i18n/keys';
import { buildCreateRequestSchema } from '@/features/request/create.schema';

const MESSAGES = {
  'request.errorTitleRequired': 'title-required',
  'request.errorTitleMax': 'title-max',
  'request.errorServiceRequired': 'service-required',
  'request.errorCityRequired': 'city-required',
  'request.errorAreaRequired': 'area-required',
  'request.errorAreaMin': 'area-min',
  'request.errorPriceInvalid': 'price-invalid',
  'request.errorPriceMin': 'price-min',
  'request.errorDateRequired': 'date-required',
  'request.errorDescriptionMax': 'description-max',
} as const;

const t = (key: I18nKey) => MESSAGES[key as keyof typeof MESSAGES] ?? key;
const schema = buildCreateRequestSchema(t);

const BASE_VALID_PAYLOAD = {
  title: 'Window cleaning job',
  serviceKey: 'window-cleaning',
  cityId: 'berlin',
  propertyType: 'apartment' as const,
  area: 50,
  preferredDate: '2026-04-11',
  isRecurring: false,
};

describe('buildCreateRequestSchema', () => {
  it('returns localized message when area is missing', () => {
    const result = schema.safeParse({ ...BASE_VALID_PAYLOAD, area: undefined });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0]?.message).toBe('area-required');
  });

  it('returns localized message when area is NaN', () => {
    const result = schema.safeParse({ ...BASE_VALID_PAYLOAD, area: Number.NaN });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0]?.message).toBe('area-required');
  });

  it('returns localized message when price is NaN', () => {
    const result = schema.safeParse({ ...BASE_VALID_PAYLOAD, price: Number.NaN });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0]?.message).toBe('price-invalid');
  });

  it('returns localized message when price is below minimum', () => {
    const result = schema.safeParse({ ...BASE_VALID_PAYLOAD, price: 0 });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0]?.message).toBe('price-min');
  });

  it('accepts payload without optional price', () => {
    const result = schema.safeParse(BASE_VALID_PAYLOAD);
    expect(result.success).toBe(true);
  });
});
