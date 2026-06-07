'use client';

import type {
  WorkspaceUnifiedRailMetricIcon,
  WorkspaceUnifiedRailMetricTone,
  WorkspaceUnifiedRailModel,
  WorkspaceUnifiedRailQueueItem,
  WorkspaceUnifiedRailRecommendationItem,
} from '@/features/workspace/shared/WorkspaceUnifiedRail';
import {
  MAX_RAIL_QUEUE_ITEMS,
  MAX_RAIL_RECOMMENDATIONS,
} from '@/features/workspace/shared/workspaceUnifiedRail.model';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { t as translate, type Locale } from '@/lib/i18n/t';
import {
  mapActivitySignalsToOpportunities,
  type StatisticsOpportunityItem,
} from './statisticsOpportunities.mapper';
import type { WorkspaceStatisticsModel } from '../statistics.model';

type StatisticsRailMapperParams = {
  locale: Locale;
  copy: WorkspaceStatisticsModel['copy'];
  decisionPlan: {
    summary: string;
    actionLabel?: string | null;
  };
  activePriceIntelligence: WorkspaceStatisticsModel['priceIntelligence'];
  selectedOpportunity: WorkspaceStatisticsModel['opportunityRadar'][number] | null;
  activitySignals: WorkspaceStatisticsModel['activitySignals'];
  kpis: WorkspaceStatisticsModel['kpis'];
  rightRailRisks: WorkspaceStatisticsModel['rightRailRisks'];
  rightRailOpportunities: WorkspaceStatisticsModel['rightRailOpportunities'];
  onPrimaryAction: () => void;
  onQueueItemAction: () => void;
};

function getMarketOpportunitiesEyebrow() {
  return 'Market Opportunities';
}

function getMarketOpportunitiesTitle(locale: Locale, count: number) {
  if (locale !== 'de') {
    return `${count} market ${count === 1 ? 'opportunity' : 'opportunities'}`;
  }

  return count === 1 ? '1 Marktchance' : `${count} Marktchancen`;
}

function getMarketOpportunitiesEmptyText(locale: Locale) {
  return locale === 'de'
    ? 'Noch keine Marktsignale verfügbar.'
    : 'No market signals available yet.';
}

function getStatsRecommendationsTitle(locale: Locale) {
  return locale === 'de' ? 'AI Empfehlungen' : 'AI Recommendations';
}

function getOpportunityBadgeLabel(
  tone: StatisticsOpportunityItem['tone'],
  copy: WorkspaceStatisticsModel['copy'],
) {
  if (tone === 'risk') return copy.insightsTypeRiskLabel;
  if (tone === 'action') return copy.insightsTypeActionLabel;
  if (tone === 'signal') return copy.insightsTypeSignalLabel;
  return copy.insightsTypeChanceLabel;
}

function mapOpportunityPriorityTone(
  tone: StatisticsOpportunityItem['tone'],
): WorkspaceUnifiedRailQueueItem['priorityTone'] {
  if (tone === 'risk') return 'high';
  if (tone === 'chance') return 'high';
  if (tone === 'action' || tone === 'signal') return 'medium';
  return 'neutral';
}

export function mapOpportunityBadgeVariant(
  tone: StatisticsOpportunityItem['tone'],
): WorkspaceUnifiedRailQueueItem['priorityBadgeVariant'] {
  if (tone === 'risk') return 'risk';
  if (tone === 'chance') return 'success';
  if (tone === 'action') return 'warning';
  return 'warning';
}

function mapPriorityTone(
  tone: 'positive' | 'neutral' | 'warning',
): WorkspaceUnifiedRailRecommendationItem['tone'] {
  if (tone === 'warning') return 'attention';
  if (tone === 'positive') return 'positive';
  return 'opportunity';
}

function getKpiMetricIcon(key: string): WorkspaceUnifiedRailMetricIcon {
  if (key.includes('provider')) return 'providers';
  if (key.includes('response') || key.includes('success')) return 'responseRate';
  return 'requests';
}

function getKpiMetricTone(key: string): WorkspaceUnifiedRailMetricTone {
  const normalized = key.toLowerCase();
  if (normalized.includes('provider') || normalized.includes('offer')) return 'supply';
  if (normalized.includes('completed') || normalized.includes('success') || normalized.includes('conversion')) {
    return 'opportunity';
  }
  if (normalized.includes('unanswered') || normalized.includes('cancel') || normalized.includes('lost')) return 'risk';
  if (normalized.includes('response')) return 'action';
  if (normalized.includes('request') || normalized.includes('demand')) return 'demand';
  return 'neutral';
}

export function mapStatisticsRailModel({
  locale,
  copy,
  decisionPlan,
  activePriceIntelligence,
  selectedOpportunity,
  activitySignals,
  kpis,
  rightRailRisks,
  rightRailOpportunities,
  onPrimaryAction,
  onQueueItemAction,
}: StatisticsRailMapperParams): WorkspaceUnifiedRailModel {
  const t = (key: string) => translate(key as never, locale);
  const analysisHref = '/workspace?section=stats';
  const primaryKpis = kpis.slice(0, 3);
  const decisionValue = selectedOpportunity
    ? selectedOpportunity.demand
    : (primaryKpis[0]?.value ?? '—');

  const metrics = selectedOpportunity
    ? [
        {
          key: 'demand',
          label: copy.opportunityDemandLabel,
          value: selectedOpportunity.demand,
          icon: 'requests' as const,
          tone: 'demand' as const,
        },
        {
          key: 'providers',
          label: copy.opportunityProvidersLabel,
          value: selectedOpportunity.providers ?? '—',
          icon: 'providers' as const,
          tone: 'supply' as const,
        },
        {
          key: 'opportunity-score',
          label: copy.opportunityScoreLabel,
          value: selectedOpportunity.score.toFixed(1),
          icon: 'responseRate' as const,
          tone: 'opportunity' as const,
        },
      ]
    : primaryKpis.map((item) => ({
        key: item.key,
        label: item.label,
        value: item.value,
        helper: item.hint,
        icon: getKpiMetricIcon(item.key),
        tone: getKpiMetricTone(item.key),
      }));

  const marketOpportunities = mapActivitySignalsToOpportunities(activitySignals);
  const queueItems: WorkspaceUnifiedRailQueueItem[] = marketOpportunities
    .slice(0, MAX_RAIL_QUEUE_ITEMS)
    .map((item) => ({
      id: item.key,
      title: item.title,
      meta: item.body,
      priorityTone: mapOpportunityPriorityTone(item.tone),
      priorityBadgeVariant: mapOpportunityBadgeVariant(item.tone),
      priorityLabel: getOpportunityBadgeLabel(item.tone, copy),
      action: {
        kind: 'button' as const,
        label: item.title,
        onClick: onQueueItemAction,
      },
    }));

  const priorityRecommendations: WorkspaceUnifiedRailRecommendationItem[] = [
    ...(rightRailOpportunities?.items ?? []),
    ...(rightRailRisks?.items ?? []),
  ].map((item) => ({
    id: item.key,
    title: item.title,
    description: item.body,
    metric: item.metric,
    tone: mapPriorityTone(item.tone),
  }));

  const priceRecommendation: WorkspaceUnifiedRailRecommendationItem[] = activePriceIntelligence.recommendation
    ? [{
        id: 'price-reco',
        title: activePriceIntelligence.recommendation,
        description: activePriceIntelligence.contextLabel
          ?? activePriceIntelligence.recommendedRangeLabel
          ?? copy.priceRecommendationLabel,
        metric: activePriceIntelligence.recommendedRangeLabel,
        tone: 'positive',
      }]
    : [];

  const recommendations = [...priorityRecommendations, ...priceRecommendation]
    .slice(0, MAX_RAIL_RECOMMENDATIONS);

  return {
    decisionPanel: {
      eyebrow: t(I18N_KEYS.requestsPage.decisionPanelTitle),
      value: decisionValue,
      contextLabel: t(I18N_KEYS.requestsPage.decisionPanelMarketOverviewEyebrow),
      title: selectedOpportunity
        ? `${selectedOpportunity.city} · ${selectedOpportunity.category}`
        : decisionPlan.summary,
      visualization: 'donut',
      metrics,
      primaryAction: {
        kind: 'button',
        label: decisionPlan.actionLabel ?? copy.kpiTitle,
        onClick: onPrimaryAction,
      },
      secondaryAction: {
        kind: 'link',
        label: t(I18N_KEYS.requestsPage.workspaceRailAnalysisCta),
        href: analysisHref,
      },
    },
    actionQueue: {
      eyebrow: getMarketOpportunitiesEyebrow(),
      title: getMarketOpportunitiesTitle(locale, marketOpportunities.length),
      items: queueItems,
      emptyText: getMarketOpportunitiesEmptyText(locale),
      footerAction: {
        kind: 'link',
        label: t(I18N_KEYS.requestsPage.workspaceRailQueueCta),
        href: analysisHref,
      },
    },
    recommendations: {
      eyebrow: t(I18N_KEYS.requestsPage.workspaceRailRecommendationsEyebrow),
      title: getStatsRecommendationsTitle(locale),
      items: recommendations,
      emptyText: t(I18N_KEYS.requestsPage.workspaceRailRecommendationsEmpty),
      footerAction: {
        kind: 'link',
        label: t(I18N_KEYS.requestsPage.workspaceRailRecommendationsCta),
        href: analysisHref,
      },
    },
  };
}
