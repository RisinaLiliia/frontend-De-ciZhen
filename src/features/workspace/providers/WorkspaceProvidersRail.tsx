'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { workspaceQK } from '@/features/workspace/data';
import { buildWorkspaceHref } from '@/features/workspace/navigation/workspaceLinks';
import {
  ALL_OPTION_KEY,
  WorkspaceSectionAside,
  buildLinkedWorkspaceRailModel,
} from '@/features/workspace/shared';
import { workspacePanelShell } from '@/features/workspace/shared/workspaceSurfaceShell';
import { resolveWorkspaceRequestsPeriod } from '@/features/workspace/state';
import { getWorkspaceProviders } from '@/lib/api/workspace';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

type WorkspaceProvidersRailProps = {
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

export function buildProvidersRailDecisionLinks(currentSearch: string | URLSearchParams) {
  return {
    overviewHref: buildWorkspaceHref({
      currentSearch,
      section: 'overview',
    }),
    analysisHref: buildWorkspaceHref({
      currentSearch,
      section: 'stats',
    }),
    providersHref: buildWorkspaceHref({
      currentSearch,
      section: 'providers',
    }),
  };
}

export function WorkspaceProvidersRail({ t, locale }: WorkspaceProvidersRailProps) {
  const searchParams = useSearchParams();
  const railLinks = React.useMemo(
    () => buildProvidersRailDecisionLinks(searchParams),
    [searchParams],
  );
  const cityId = normalizeFilter(searchParams.get('cityId'));
  const categoryKey = normalizeFilter(searchParams.get('categoryKey'));
  const subcategoryKey = normalizeFilter(searchParams.get('subcategoryKey'));
  const viewerModeParam = searchParams.get('viewerMode');
  const viewerMode =
    viewerModeParam === 'customer' || viewerModeParam === 'provider' ? viewerModeParam : undefined;
  const period = resolveWorkspaceRequestsPeriod(
    searchParams.get('period') ?? searchParams.get('range'),
  );

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
  const railModel = React.useMemo(
    () =>
      buildLinkedWorkspaceRailModel({
        locale,
        contextLabel: t(I18N_KEYS.requestsPage.workspaceRailProvidersContext),
        summaryItems,
        panel: contractData
          ? {
              eyebrow: contractData.decisionPanel.eyebrow,
              totalValue: contractData.decisionPanel.totalNeedsAction,
              title: t(I18N_KEYS.requestsPage.workspaceRailProvidersContext),
              text: contractData.decisionPanel.text,
              visualization: 'donut',
              primaryAction: {
                kind: 'link',
                label: t(I18N_KEYS.requestsPage.workspaceRailProvidersPrimaryCta),
                href: railLinks.overviewHref,
              },
              secondaryAction: {
                kind: 'link',
                label: t(I18N_KEYS.requestsPage.workspaceRailAnalysisCta),
                href: railLinks.analysisHref,
              },
              queueTitle: contractData.decisionPanel.queueTitle,
              queue: contractData.decisionPanel.queue.map((item) => ({
                id: item.providerId,
                title: item.title,
                actionLabel: item.actionLabel,
                actionPriorityLevel: item.actionPriorityLevel,
                action: {
                  kind: 'link',
                  href: item.href,
                  label: item.title,
                },
              })),
              emptyText: contractData.decisionPanel.emptyText,
              overview: contractData.decisionPanel.overview,
            }
          : null,
        analysisHref: railLinks.analysisHref,
        queueCountTemplate: t(I18N_KEYS.requestsPage.workspaceRailProvidersQueueCountTemplate),
        queueFooterHref: railLinks.providersHref,
        recommendationsFooterHref: railLinks.analysisHref,
      }),
    [
      contractData,
      locale,
      railLinks.analysisHref,
      railLinks.overviewHref,
      railLinks.providersHref,
      summaryItems,
      t,
    ],
  );

  return (
    <WorkspaceSectionAside
      className="workspace-providers-rail"
      model={railModel}
      isLoading={isContractLoading}
    >
      {isContractError ? (
        <section className={workspacePanelShell()}>
          <p className="typo-muted">{t(I18N_KEYS.common.loadError)}</p>
        </section>
      ) : null}
    </WorkspaceSectionAside>
  );
}
