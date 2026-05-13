'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { getWorkspaceProviders } from '@/lib/api/workspace';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { ALL_OPTION_KEY, resolveWorkspaceRequestsPeriod } from '@/features/workspace/requests';
import { workspaceQK } from '@/features/workspace/requests/queryKeys';
import { WorkspaceSectionAside } from '@/features/workspace/requests/components/WorkspaceSectionAside';

type Props = {
  t: (key: I18nKey) => string;
  locale: Locale;
};

function normalizeFilter(value: string | null) {
  const normalized = String(value ?? '').trim();
  if (!normalized || normalized === ALL_OPTION_KEY) {
    return undefined;
  }
  return normalized;
}

export function WorkspaceProvidersAside({
  t,
  locale,
}: Props) {
  const searchParams = useSearchParams();
  const cityId = normalizeFilter(searchParams.get('cityId'));
  const categoryKey = normalizeFilter(searchParams.get('categoryKey'));
  const subcategoryKey = normalizeFilter(searchParams.get('subcategoryKey'));
  const viewerModeParam = searchParams.get('viewerMode');
  const viewerMode = viewerModeParam === 'customer' || viewerModeParam === 'provider'
    ? viewerModeParam
    : undefined;
  const period = resolveWorkspaceRequestsPeriod(searchParams.get('period') ?? searchParams.get('range'));

  const {
    data: contractData,
    isLoading: isContractLoading,
    isError: isContractError,
  } = useQuery({
    queryKey: workspaceQK.workspaceProvidersOverview({
      cityId,
      categoryKey,
      subcategoryKey,
      period,
      viewerMode,
    }),
    queryFn: () =>
      getWorkspaceProviders({
        cityId,
        categoryKey,
        subcategoryKey,
        period,
        viewerMode,
      }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const summaryItems = React.useMemo(
    () =>
      contractData?.summary.items.map((item) => ({
        key: item.key,
        label: item.label,
        value: item.value,
        helper: item.helper,
        tone: item.tone,
      })) ?? null,
    [contractData],
  );

  return (
    <WorkspaceSectionAside
      locale={locale}
      summaryItems={summaryItems}
      isLoading={isContractLoading}
      panel={contractData ? {
        ...contractData.decisionPanel,
        queue: contractData.decisionPanel.queue.map((item) => ({
          id: item.providerId,
          title: item.title,
          actionLabel: item.actionLabel,
          actionPriorityLevel: item.actionPriorityLevel,
          actionReason: item.actionReason,
          href: item.href,
        })),
      } : null}
    >
      {isContractError ? (
        <section className="panel">
          <p className="typo-muted">{t(I18N_KEYS.common.loadError)}</p>
        </section>
      ) : null}
    </WorkspaceSectionAside>
  );
}
