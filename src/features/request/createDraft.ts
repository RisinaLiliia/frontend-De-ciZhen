import type { CreateRequestValues } from './create.schema';

export const REQUEST_DRAFT_STORAGE_KEY = 'dc_request_create_draft_v1';

export type RequestDraft = {
  values: {
    serviceKey: string;
    cityId: string;
    title: string;
    propertyType: CreateRequestValues['propertyType'];
    area: number;
    price?: number;
    preferredDate: string;
    isRecurring: boolean;
    description: string;
  };
  tags: string[];
  categoryKey: string;
  savedAt: number;
};

function sanitizeDraftValues(values: Partial<RequestDraft['values']>): RequestDraft['values'] {
  return {
    serviceKey: typeof values.serviceKey === 'string' ? values.serviceKey : '',
    cityId: typeof values.cityId === 'string' ? values.cityId : '',
    title: typeof values.title === 'string' ? values.title : '',
    propertyType: values.propertyType === 'house' ? 'house' : 'apartment',
    area: typeof values.area === 'number' && Number.isFinite(values.area) ? values.area : 50,
    price: typeof values.price === 'number' && Number.isFinite(values.price) ? values.price : undefined,
    preferredDate: typeof values.preferredDate === 'string' ? values.preferredDate : '',
    isRecurring: Boolean(values.isRecurring),
    description: typeof values.description === 'string' ? values.description : '',
  };
}

export function readRequestDraft(): RequestDraft | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(REQUEST_DRAFT_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<RequestDraft> | null;
    if (!parsed || typeof parsed !== 'object' || typeof parsed.values !== 'object') {
      return null;
    }
    const values = sanitizeDraftValues(parsed.values as Partial<RequestDraft['values']>);
    return {
      values,
      tags: Array.isArray(parsed.tags)
        ? parsed.tags.filter((item): item is string => typeof item === 'string')
        : [],
      categoryKey: typeof parsed.categoryKey === 'string' ? parsed.categoryKey : '',
      savedAt: typeof parsed.savedAt === 'number' ? parsed.savedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function writeRequestDraft(payload: RequestDraft) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(REQUEST_DRAFT_STORAGE_KEY, JSON.stringify(payload));
}

export function clearRequestDraft() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(REQUEST_DRAFT_STORAGE_KEY);
}

