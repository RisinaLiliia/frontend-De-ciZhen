'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type { ProviderReviewSort } from '@/features/providers/publicProfile/useProviderReviewsModel';
import type { ReviewRange } from '@/lib/api/dto/reviews';
import {
  DEFAULT_WORKSPACE_REVIEW_RANGE,
  DEFAULT_WORKSPACE_REVIEW_SORT,
} from '@/features/workspace/requests/workspaceReviewControls';

const REVIEW_SORT_QUERY_KEY = 'reviewSort';
const REVIEW_RANGE_QUERY_KEY = 'reviewRange';

function parseReviewSort(value: string | null): ProviderReviewSort {
  return value === 'top' ? 'top' : DEFAULT_WORKSPACE_REVIEW_SORT;
}

function parseReviewRange(value: string | null): ReviewRange {
  if (value === '24h' || value === '7d' || value === '90d') return value;
  return DEFAULT_WORKSPACE_REVIEW_RANGE;
}

export function useWorkspaceReviewControlsState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reviewSort = parseReviewSort(searchParams.get(REVIEW_SORT_QUERY_KEY));
  const reviewRange = parseReviewRange(searchParams.get(REVIEW_RANGE_QUERY_KEY));

  const replaceParams = React.useCallback((mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const setReviewSort = React.useCallback((next: ProviderReviewSort) => {
    replaceParams((params) => {
      if (next === DEFAULT_WORKSPACE_REVIEW_SORT) {
        params.delete(REVIEW_SORT_QUERY_KEY);
      } else {
        params.set(REVIEW_SORT_QUERY_KEY, next);
      }
    });
  }, [replaceParams]);

  const setReviewRange = React.useCallback((next: ReviewRange) => {
    replaceParams((params) => {
      if (next === DEFAULT_WORKSPACE_REVIEW_RANGE) {
        params.delete(REVIEW_RANGE_QUERY_KEY);
      } else {
        params.set(REVIEW_RANGE_QUERY_KEY, next);
      }
    });
  }, [replaceParams]);

  const resetReviewControls = React.useCallback(() => {
    replaceParams((params) => {
      params.delete(REVIEW_SORT_QUERY_KEY);
      params.delete(REVIEW_RANGE_QUERY_KEY);
    });
  }, [replaceParams]);

  return {
    reviewSort,
    setReviewSort,
    reviewRange,
    setReviewRange,
    resetReviewControls,
  };
}
