'use client';

import type { ComponentProps } from 'react';

import {
  WorkspaceRequestsSummaryStrip,
  WorkspaceRequestsSummaryStripSkeleton,
} from '@/features/workspace/requests/components/WorkspaceRequestsSummaryStrip';

type Props = {
  summaryStripProps?: ComponentProps<typeof WorkspaceRequestsSummaryStrip>;
  isLoading?: boolean;
};

export function RequestsWorkspaceSummary({
  summaryStripProps,
  isLoading = false,
}: Props) {
  if (isLoading && !summaryStripProps) {
    return <WorkspaceRequestsSummaryStripSkeleton />;
  }

  if (!summaryStripProps) {
    return null;
  }

  return <WorkspaceRequestsSummaryStrip {...summaryStripProps} />;
}
