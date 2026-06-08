'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  WorkspaceRequestsSummaryStrip,
  WorkspaceRequestsSummaryStripSkeleton,
} from '@/features/workspace/requests/components/WorkspaceRequestsSummaryStrip';
import type { WorkspaceRequestsSummaryItem, WorkspaceRequestsViewVariant } from '@/features/workspace/requests/workspaceRequestsView.model';
import type { Locale } from '@/lib/i18n/t';

type Props = {
  locale: Locale;
  items?: WorkspaceRequestsSummaryItem[] | null;
  variant: WorkspaceRequestsViewVariant;
  isLoading?: boolean;
  className?: string;
};

function buildWorkspaceHref(pathname: string, params: URLSearchParams) {
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function WorkspaceRequestsSectionSummary({
  locale,
  items,
  variant,
  isLoading = false,
  className,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const summaryItems = items ?? null;

  const handleSelect = React.useCallback((nextState: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('section', 'requests');
    params.set('scope', variant === 'market' ? 'market' : 'my');
    params.set('state', nextState);
    router.replace(buildWorkspaceHref(pathname, params), { scroll: false });
  }, [pathname, router, searchParams, variant]);

  if (isLoading && !summaryItems) {
    return <WorkspaceRequestsSummaryStripSkeleton className={className} />;
  }

  if (!summaryItems) {
    return null;
  }

  return (
    <WorkspaceRequestsSummaryStrip
      locale={locale}
      items={summaryItems}
      onSelect={handleSelect}
      variant={variant}
      className={className}
    />
  );
}
