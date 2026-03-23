'use client';

import type { ProviderReviewSort } from '@/features/providers/publicProfile/useProviderReviewsModel';
import type { Locale } from '@/lib/i18n/t';
import type { ReviewRange } from '@/lib/api/dto/reviews';

export const DEFAULT_WORKSPACE_REVIEW_SORT: ProviderReviewSort = 'latest';
export const DEFAULT_WORKSPACE_REVIEW_RANGE: ReviewRange = '30d';
export const WORKSPACE_REVIEW_RANGE_OPTIONS: ReviewRange[] = ['24h', '7d', '30d', '90d'];

export function getWorkspaceReviewRangeLabel(range: ReviewRange, locale: Locale) {
  if (range === '24h') return '24h';
  if (range === '7d') return locale === 'de' ? '7 Tage' : '7 days';
  if (range === '30d') return locale === 'de' ? '30 Tage' : '30 days';
  return locale === 'de' ? '90 Tage' : '90 days';
}
