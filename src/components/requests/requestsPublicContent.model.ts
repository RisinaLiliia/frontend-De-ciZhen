'use client';

import type { ComponentProps } from 'react';

import type { RequestsFilters } from '@/components/requests/RequestsFilters';
import type { PublicContent } from '@/features/workspace/requests/PublicContent';
import { I18N_KEYS } from '@/lib/i18n/keys';

type BuildRequestsPublicFiltersArgs = ComponentProps<typeof RequestsFilters>;

type BuildRequestsPublicContentArgs = Omit<ComponentProps<typeof PublicContent>, 'resultsLabel'> & {
  resultsLabel?: ComponentProps<typeof PublicContent>['resultsLabel'];
};

export function buildRequestsPublicFiltersProps(
  params: BuildRequestsPublicFiltersArgs,
): ComponentProps<typeof RequestsFilters> {
  return params;
}

export function buildRequestsPublicContentProps(
  params: BuildRequestsPublicContentArgs,
): ComponentProps<typeof PublicContent> {
  return {
    ...params,
    resultsLabel: params.resultsLabel ?? params.t(I18N_KEYS.requestsPage.resultsLabel),
  };
}
