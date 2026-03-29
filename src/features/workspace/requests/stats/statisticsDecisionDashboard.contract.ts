'use client';

import type {
  WorkspaceStatisticsCategoryDemandDto,
  WorkspaceStatisticsContextHealthDto,
  WorkspaceStatisticsDecisionContextDto,
  WorkspaceStatisticsExportMetaDto,
  WorkspaceStatisticsFilterOptionDto,
  WorkspaceStatisticsFilterOptionsDto,
  WorkspaceStatisticsOverviewDto,
  WorkspaceStatisticsPriceIntelligenceDto,
  WorkspaceStatisticsSectionMetaDto,
} from '@/lib/api/dto/workspace';
import type { WorkspaceStatisticsOverviewSourceDto } from './statisticsModel.types';
import {
  buildFocusedOpportunityRadar,
  ensureStatisticsOpportunityContract,
} from './statisticsOpportunityContract.utils';
import {
  buildCompatibilityCategoryFit,
  buildCompatibilityCityComparison,
  buildCompatibilityDecisionLayer,
  buildCompatibilityFunnelComparison,
  buildCompatibilityPersonalizedPricing,
  buildCompatibilityUserIntelligence,
} from './statisticsUserIntelligence.utils';

export type DecisionDashboardFilters = {
  period: WorkspaceStatisticsOverviewDto['range'];
  cityId: string | null;
  regionId?: string | null;
  categoryKey: string | null;
};

export type WorkspaceStatisticsDecisionDashboardDto = WorkspaceStatisticsOverviewSourceDto & {
  decisionContext: WorkspaceStatisticsDecisionContextDto;
  filterOptions: WorkspaceStatisticsFilterOptionsDto & {
    services: WorkspaceStatisticsFilterOptionDto[];
  };
  sectionMeta: WorkspaceStatisticsSectionMetaDto;
  exportMeta: WorkspaceStatisticsExportMetaDto;
};

function normalizeFilterValue(value: string | null | undefined): string | null {
  const normalized = String(value ?? '').trim();
  return normalized.length > 0 ? normalized : null;
}

function compareOptions(a: WorkspaceStatisticsFilterOptionDto, b: WorkspaceStatisticsFilterOptionDto) {
  return a.label.localeCompare(b.label, 'de-DE');
}

function buildFilterOptions(payload: WorkspaceStatisticsOverviewSourceDto): WorkspaceStatisticsDecisionDashboardDto['filterOptions'] {
  const explicitCities = payload.filterOptions?.cities ?? [];
  const explicitCategories = payload.filterOptions?.categories ?? [];
  const explicitServices = payload.filterOptions?.services ?? [];

  const cities = explicitCities.length > 0
    ? explicitCities
    : (payload.demand.cities ?? [])
      .map((city) => ({
        value: city.cityId ?? city.citySlug,
        label: city.cityName,
      }))
      .sort(compareOptions);

  const categoryMap = new Map<string, WorkspaceStatisticsFilterOptionDto>();
  explicitCategories.forEach((option) => categoryMap.set(option.value, option));
  if (categoryMap.size === 0) {
    (payload.demand.categories ?? []).forEach((category) => {
      const value = normalizeFilterValue(category.categoryKey);
      if (!value) return;
      categoryMap.set(value, {
        value,
        label: category.categoryName,
      });
    });
    (payload.opportunityRadar ?? []).forEach((item) => {
      const value = normalizeFilterValue(item.categoryKey);
      const label = String(item.category ?? '').trim();
      if (!value || !label || categoryMap.has(value)) return;
      categoryMap.set(value, { value, label });
    });
    const priceValue = normalizeFilterValue(payload.priceIntelligence?.categoryKey);
    const priceLabel = String(payload.priceIntelligence?.category ?? '').trim();
    if (priceValue && priceLabel && !categoryMap.has(priceValue)) {
      categoryMap.set(priceValue, { value: priceValue, label: priceLabel });
    }
  }

  return {
    cities,
    categories: Array.from(categoryMap.values()).sort(compareOptions),
    services: explicitServices,
  };
}

function ensureFilterOptions(
  filterOptions: WorkspaceStatisticsFilterOptionsDto,
): WorkspaceStatisticsDecisionDashboardDto['filterOptions'] {
  return {
    ...filterOptions,
    services: filterOptions.services ?? [],
  };
}

function scopeDemandRows(
  payload: WorkspaceStatisticsOverviewSourceDto,
  filters: DecisionDashboardFilters,
): WorkspaceStatisticsCategoryDemandDto[] {
  const rows = (payload.demand.categories ?? []).slice();
  rows.sort(
    (a, b) =>
      (b.sharePercent - a.sharePercent) ||
      (b.requestCount - a.requestCount) ||
      a.categoryName.localeCompare(b.categoryName, 'de-DE'),
  );
  if (!filters.categoryKey) return rows;
  return rows.filter((row) => normalizeFilterValue(row.categoryKey) === filters.categoryKey);
}

function scopeCityRows(
  payload: WorkspaceStatisticsOverviewSourceDto,
  filters: DecisionDashboardFilters,
) {
  const rows = (payload.demand.cities ?? []).slice();
  if (!filters.cityId) return rows;
  return rows.filter((row) => (row.cityId ?? row.citySlug) === filters.cityId);
}

function scopeOpportunityRadar(
  payload: WorkspaceStatisticsOverviewSourceDto,
  filters: DecisionDashboardFilters,
) {
  return buildFocusedOpportunityRadar(payload, {
    cityId: filters.cityId,
    categoryKey: filters.categoryKey,
    limit: 3,
  });
}

function sortOpportunityRadar(
  items: NonNullable<WorkspaceStatisticsOverviewSourceDto['opportunityRadar']>,
) {
  return items
    .slice()
    .slice(0, 3);
}

function scopePriceIntelligence(params: {
  payload: WorkspaceStatisticsOverviewSourceDto;
  opportunityRadar: NonNullable<WorkspaceStatisticsOverviewSourceDto['opportunityRadar']>;
}): WorkspaceStatisticsPriceIntelligenceDto | undefined {
  if (params.opportunityRadar.length === 0) return undefined;
  const source = params.opportunityRadar[0]?.priceIntelligence ?? params.payload.priceIntelligence;
  if (!source) return undefined;

  return source;
}

function buildHealthMetrics(params: {
  demandRows: WorkspaceStatisticsCategoryDemandDto[];
  cityRows: WorkspaceStatisticsOverviewSourceDto['demand']['cities'];
  opportunityRadar: NonNullable<WorkspaceStatisticsOverviewSourceDto['opportunityRadar']>;
  payload: WorkspaceStatisticsOverviewSourceDto;
}): WorkspaceStatisticsContextHealthDto[] {
  const leadingDemand = params.demandRows[0];
  const latestDelta =
    Number(params.payload.activity.totals.latestRequests ?? 0) -
    Number(params.payload.activity.totals.previousRequests ?? 0);
  const competitionRatio =
    params.opportunityRadar[0]?.marketBalanceRatio ??
    params.cityRows[0]?.marketBalanceRatio ??
    null;

  return [
    {
      key: 'demand',
      value: leadingDemand
        ? leadingDemand.sharePercent >= 45 ? 'rising' : 'stable'
        : 'limited',
      tone: leadingDemand
        ? leadingDemand.sharePercent >= 45 ? 'positive' : 'neutral'
        : 'warning',
    },
    {
      key: 'competition',
      value: competitionRatio === null
        ? 'balanced'
        : competitionRatio >= 2
          ? 'low'
          : competitionRatio >= 1
            ? 'balanced'
            : 'high',
      tone: competitionRatio === null
        ? 'neutral'
        : competitionRatio >= 2
          ? 'positive'
          : competitionRatio >= 1
            ? 'neutral'
            : 'warning',
    },
    {
      key: 'activity',
      value: latestDelta > 0 ? 'high' : latestDelta < 0 ? 'low' : 'stable',
      tone: latestDelta > 0 ? 'positive' : latestDelta < 0 ? 'warning' : 'neutral',
    },
  ];
}

function buildDecisionContext(params: {
  payload: WorkspaceStatisticsOverviewSourceDto;
  filters: DecisionDashboardFilters;
  filterOptions: WorkspaceStatisticsDecisionDashboardDto['filterOptions'];
  demandRows: WorkspaceStatisticsCategoryDemandDto[];
  cityRows: WorkspaceStatisticsOverviewSourceDto['demand']['cities'];
  opportunityRadar: NonNullable<WorkspaceStatisticsOverviewSourceDto['opportunityRadar']>;
  priceIntelligence: WorkspaceStatisticsPriceIntelligenceDto | undefined;
}): WorkspaceStatisticsDecisionContextDto {
  if (params.payload.decisionContext) {
    return {
      ...params.payload.decisionContext,
      health: params.payload.decisionContext.health ?? [],
      lowData: params.payload.decisionContext.lowData ?? { isLowData: false },
    };
  }

  const selectedCity = params.filterOptions.cities.find((item) => item.value === params.filters.cityId);
  const selectedCategory = params.filterOptions.categories.find((item) => item.value === params.filters.categoryKey);
  const cityLabel = selectedCity?.label ?? 'Alle Städte';
  const categoryLabel = selectedCategory?.label ?? 'Alle Kategorien';
  const isFocusMode = Boolean(params.filters.cityId || params.filters.categoryKey);
  const hasScopedPriceData = Boolean(
    params.priceIntelligence?.recommendedMin !== null ||
    params.priceIntelligence?.recommendedMax !== null ||
    params.priceIntelligence?.marketAverage !== null,
  );
  const isLowData = isFocusMode && (
    (params.filters.cityId && params.cityRows.length === 0) ||
    (params.filters.categoryKey && params.demandRows.length === 0) ||
    params.opportunityRadar.length === 0 ||
    !hasScopedPriceData
  );

  return {
    mode: isFocusMode ? 'focus' : 'global',
    period: params.filters.period,
    city: {
      value: params.filters.cityId,
      label: cityLabel,
    },
    region: {
      value: params.filters.regionId ?? null,
      label: 'Alle Regionen',
    },
    category: {
      value: params.filters.categoryKey,
      label: categoryLabel,
    },
    service: null,
    health: buildHealthMetrics({
      demandRows: params.demandRows,
      cityRows: params.cityRows,
      opportunityRadar: params.opportunityRadar,
      payload: params.payload,
    }),
    lowData: {
      isLowData,
      title: isLowData ? 'Zu wenig Daten für eine verlässliche Segmentanalyse' : null,
      body: isLowData ? 'Erweitern Sie den Zeitraum oder wechseln Sie zu Alle Städte bzw. Alle Kategorien.' : null,
    },
  };
}

function buildSectionMeta(
  payload: WorkspaceStatisticsOverviewSourceDto,
  context: WorkspaceStatisticsDecisionContextDto,
): WorkspaceStatisticsSectionMetaDto {
  if (payload.sectionMeta) return payload.sectionMeta;

  const focusLabel =
    context.mode === 'focus'
      ? [context.category.value ? context.category.label : null, context.city.value ? context.city.label : null]
        .filter(Boolean)
        .join(' · ')
      : null;

  return {
    opportunityTitle: focusLabel ? `Opportunity Radar für ${focusLabel}` : undefined,
    priceTitle: undefined,
    insightsSubtitle: undefined,
    growthSubtitle: focusLabel ? `Wachstum & Promotion · ${focusLabel}` : undefined,
  };
}

function buildExportMeta(
  payload: WorkspaceStatisticsOverviewSourceDto,
  filters: DecisionDashboardFilters,
): WorkspaceStatisticsExportMetaDto {
  if (payload.exportMeta) return payload.exportMeta;

  const scopeSuffix = [filters.cityId, filters.categoryKey].filter(Boolean).join('-');
  return {
    filename: `workspace-statistics-${filters.period}${scopeSuffix ? `-${scopeSuffix}` : ''}-${new Date().toISOString().slice(0, 10)}.csv`,
  };
}

export function normalizeWorkspaceDecisionDashboardResponse(
  payload: WorkspaceStatisticsOverviewSourceDto,
  filters: DecisionDashboardFilters,
): WorkspaceStatisticsDecisionDashboardDto {
  const normalizedPayload = ensureStatisticsOpportunityContract(payload);

  const filterOptions = payload.filterOptions
    ? ensureFilterOptions(payload.filterOptions)
    : buildFilterOptions(normalizedPayload);
  const cityRows = scopeCityRows(normalizedPayload, filters);
  const demandRows = scopeDemandRows(normalizedPayload, filters);
  const opportunityRadar = sortOpportunityRadar(scopeOpportunityRadar(normalizedPayload, filters));
  const priceIntelligence = scopePriceIntelligence({
    payload: normalizedPayload,
    opportunityRadar,
  });
  const decisionContext = payload.decisionContext ?? buildDecisionContext({
    payload: normalizedPayload,
    filters,
    filterOptions,
    demandRows,
    cityRows,
    opportunityRadar,
    priceIntelligence,
  });
  const userIntelligence = payload.userIntelligence ?? buildCompatibilityUserIntelligence({
    payload: normalizedPayload,
    priceIntelligence,
  });
  const decisionLayer = payload.decisionLayer ?? buildCompatibilityDecisionLayer({
    payload: normalizedPayload,
    userIntelligence,
  });
  const personalizedPricing = payload.personalizedPricing ?? buildCompatibilityPersonalizedPricing({
    payload: normalizedPayload,
    userIntelligence,
    priceIntelligence,
  });
  const categoryFit = payload.categoryFit ?? buildCompatibilityCategoryFit({
    payload: normalizedPayload,
    userIntelligence,
  });
  const cityComparison = payload.cityComparison ?? buildCompatibilityCityComparison({
    payload: normalizedPayload,
    userIntelligence,
  });

  return {
    ...normalizedPayload,
    demand: {
      ...normalizedPayload.demand,
      categories: demandRows,
      cities: cityRows,
    },
    opportunityRadar,
    priceIntelligence,
    decisionContext,
    filterOptions,
    sectionMeta: payload.sectionMeta ?? buildSectionMeta(normalizedPayload, decisionContext),
    exportMeta: payload.exportMeta ?? buildExportMeta(normalizedPayload, filters),
    decisionLayer,
    personalizedPricing,
    categoryFit,
    cityComparison,
    funnelComparison: payload.funnelComparison ?? buildCompatibilityFunnelComparison({
      payload: normalizedPayload,
      userIntelligence,
    }),
    userIntelligence,
  };
}
