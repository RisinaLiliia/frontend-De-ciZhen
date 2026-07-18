'use client';

import { WorkspaceResultsSummary } from '@/features/workspace/shared';
import type { RequestsResultsSummaryProps } from './requestsFilters.types';

export function RequestsResultsSummary({
  ...props
}: RequestsResultsSummaryProps) {
  return <WorkspaceResultsSummary {...props} />;
}
