import type { WorkspaceStatisticsModel } from './statistics.model';

export function resolveGrowthMarketContext(params: {
  copy: WorkspaceStatisticsModel['copy'];
  filters: WorkspaceStatisticsModel['filters'];
  context: WorkspaceStatisticsModel['context'];
  cityRows: WorkspaceStatisticsModel['cityRows'];
  selectedOpportunity: WorkspaceStatisticsModel['opportunityRadar'][number] | null;
  opportunityRadar: WorkspaceStatisticsModel['opportunityRadar'];
  userIntelligence: WorkspaceStatisticsModel['userIntelligence'];
  growthCards: WorkspaceStatisticsModel['growthCards'];
  fallbackFocusLabel: string | null;
}) {
  const {
    copy,
    filters,
    context,
    cityRows,
    selectedOpportunity,
    opportunityRadar,
    userIntelligence,
    growthCards,
    fallbackFocusLabel,
  } = params;

  const filteredCityRow = filters.cityId
    ? (cityRows.find((item) => item.cityId === filters.cityId) ?? null)
    : null;
  const personalizedCityLabel =
    userIntelligence?.opportunities.find((item) => item.cityLabel)?.cityLabel?.trim() || null;
  const selectedOpportunityCityLabel = selectedOpportunity?.city?.trim() || null;
  const localAdsContextLabel =
    growthCards.find((item) => item.key === 'local_ads')?.recommendedFor?.trim() || null;
  const fallbackCityRow = cityRows[0] ?? null;
  const contextCityLabel =
    context.cityLabel !== copy.contextAllCitiesLabel ? context.cityLabel : null;

  const focusCityLabel =
    filteredCityRow?.name ??
    personalizedCityLabel ??
    selectedOpportunityCityLabel ??
    localAdsContextLabel ??
    fallbackCityRow?.name ??
    contextCityLabel ??
    fallbackFocusLabel ??
    null;

  const normalizedFocusCityLabel = focusCityLabel?.trim().toLowerCase() || null;
  const focusCityRow =
    filteredCityRow ??
    (normalizedFocusCityLabel
      ? (cityRows.find((item) => item.name.trim().toLowerCase() === normalizedFocusCityLabel) ??
        null)
      : null);
  const focusOpportunity =
    selectedOpportunity?.city.trim().toLowerCase() === normalizedFocusCityLabel
      ? selectedOpportunity
      : normalizedFocusCityLabel
        ? (opportunityRadar.find(
            (item) => item.city.trim().toLowerCase() === normalizedFocusCityLabel,
          ) ?? null)
        : null;

  return {
    focusLabel: focusCityLabel,
    demand: resolveGrowthDemandMeta(copy, focusCityRow?.signal ?? null, focusOpportunity),
    competition: resolveGrowthCompetitionMeta(
      copy,
      focusCityRow?.marketBalanceRatio ?? focusOpportunity?.marketBalanceRatio ?? null,
    ),
  };
}

export function resolveGrowthDemandMeta(
  copy: WorkspaceStatisticsModel['copy'],
  citySignal: WorkspaceStatisticsModel['cityRows'][number]['signal'] | null,
  opportunity: WorkspaceStatisticsModel['opportunityRadar'][number] | null,
) {
  if (citySignal) {
    if (citySignal === 'high')
      return { label: copy.opportunitySemanticHigh, tone: 'positive' as const };
    if (citySignal === 'medium')
      return { label: copy.opportunitySemanticMedium, tone: 'neutral' as const };
    if (citySignal === 'low')
      return { label: copy.opportunitySemanticLow, tone: 'warning' as const };
  }

  if (opportunity) {
    if (opportunity.demandScore >= 7)
      return { label: copy.opportunitySemanticHigh, tone: 'positive' as const };
    if (opportunity.demandScore >= 4)
      return { label: copy.opportunitySemanticMedium, tone: 'neutral' as const };
    return { label: copy.opportunitySemanticLow, tone: 'warning' as const };
  }

  return { label: copy.growthDemandHighValue, tone: 'positive' as const };
}

export function resolveGrowthCompetitionMeta(
  copy: WorkspaceStatisticsModel['copy'],
  marketBalanceRatio: number | null,
) {
  if (typeof marketBalanceRatio !== 'number' || !Number.isFinite(marketBalanceRatio)) {
    return { label: copy.growthCompetitionMedium, tone: 'neutral' as const };
  }
  if (marketBalanceRatio >= 1.6)
    return { label: copy.contextHealthCompetitionLow, tone: 'positive' as const };
  if (marketBalanceRatio <= 1)
    return { label: copy.contextHealthCompetitionHigh, tone: 'warning' as const };
  return { label: copy.contextHealthCompetitionBalanced, tone: 'neutral' as const };
}
