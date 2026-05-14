'use client';

import type { ProviderReviewSort } from '@/features/providers/publicProfile/useProviderReviewsModel';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { ReviewRange } from '@/lib/api/dto/reviews';

export const DEFAULT_WORKSPACE_REVIEW_SORT: ProviderReviewSort = 'latest';
export const DEFAULT_WORKSPACE_REVIEW_RANGE: ReviewRange = '30d';
export const WORKSPACE_REVIEW_RANGE_OPTIONS: ReviewRange[] = ['24h', '7d', '30d', '90d'];

export function getWorkspaceReviewRangeLabel(range: ReviewRange, t: (key: I18nKey) => string) {
  if (range === '24h') return '24h';
  if (range === '7d') return t(I18N_KEYS.workspace.range7dLabel);
  if (range === '30d') return t(I18N_KEYS.workspace.range30dLabel);
  return t(I18N_KEYS.workspace.range90dLabel);
}
