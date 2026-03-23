'use client';

import type { ProviderReviewSort } from '@/features/providers/publicProfile/useProviderReviewsModel';
import type { WorkspaceStatisticsRange } from '@/lib/api/dto/workspace';
import type { Locale } from '@/lib/i18n/t';

export const DEFAULT_WORKSPACE_REVIEW_SORT: ProviderReviewSort = 'latest';
export const DEFAULT_WORKSPACE_REVIEW_RANGE: WorkspaceStatisticsRange = '30d';
export const WORKSPACE_REVIEW_RANGE_OPTIONS: WorkspaceStatisticsRange[] = ['24h', '7d', '30d', '90d'];

export function getWorkspaceReviewRangeLabel(range: WorkspaceStatisticsRange, locale: Locale) {
  if (range === '24h') return '24h';
  if (range === '7d') return locale === 'de' ? '7 Tage' : '7 days';
  if (range === '30d') return locale === 'de' ? '30 Tage' : '30 days';
  return locale === 'de' ? '90 Tage' : '90 days';
}
