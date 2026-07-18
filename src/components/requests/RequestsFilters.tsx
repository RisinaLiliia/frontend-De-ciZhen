// src/components/requests/RequestsFilters.tsx
'use client';

import {
  WorkspaceFilterControls,
  WorkspaceFilters,
  WorkspaceResultsSummary,
} from '@/features/workspace/shared';
import type {
  RequestsFilterControlsProps,
  RequestsFiltersProps,
} from './requestsFilters.types';

export type { FilterOption } from './requestsFilters.types';
export { WorkspaceResultsSummary as RequestsResultsSummary } from '@/features/workspace/shared';

export function RequestsFilterControls({
  ...props
}: RequestsFilterControlsProps) {
  return <WorkspaceFilterControls {...props} />;
}

export function RequestsFilters({
  ...props
}: RequestsFiltersProps) {
  return <WorkspaceFilters {...props} />;
}
