import type { WorkspaceStatisticsGrowthCardDto, WorkspaceStatisticsInsightDto } from '@/lib/api/dto/workspace';
import type { Locale } from '@/lib/i18n/t';
import { COPY_DE } from './statistics.copy.de';
import { COPY_EN } from './statistics.copy.en';

export type WorkspaceStatisticsCopy = {
  subtitle: string;
  rangeGroupLabel: string;
  range24h: string;
  range7d: string;
  range30d: string;
  range90d: string;
  contextTitle: string;
  contextSubtitle: string;
  contextPeriodLabel: string;
  contextCityLabel: string;
  contextCategoryLabel: string;
  contextTrendLabel: string;
  contextAllCitiesLabel: string;
  contextAllCategoriesLabel: string;
  contextAllServicesLabel: string;
  contextResetLabel: string;
  contextScopeGlobalLabel: string;
  contextScopeFocusLabel: string;
  contextHealthDemandLabel: string;
  contextHealthCompetitionLabel: string;
  contextHealthActivityLabel: string;
  contextHealthDemandRising: string;
  contextHealthDemandStable: string;
  contextHealthDemandLimited: string;
  contextHealthCompetitionHigh: string;
  contextHealthCompetitionBalanced: string;
  contextHealthCompetitionLow: string;
  contextHealthActivityHigh: string;
  contextHealthActivityStable: string;
  contextHealthActivityLow: string;
  contextLowDataTitle: string;
  contextLowDataBody: string;
  backgroundErrorTitle: string;
  backgroundErrorBody: string;
  exportLabel: string;
  modePlatform: string;
  modePersonalized: string;
  viewerModeLabel: string;
  viewerModeProviderLabel: string;
  viewerModeCustomerLabel: string;
  kpiTitle: string;
  activityTitle: string;
  activitySubtitle: string;
  marketHealthTitle: string;
  marketHealthSubtitle: string;
  marketOpportunitiesTitle: string;
  marketOpportunitiesSubtitle: string;
  decisionKiFallbackInsight: string;
  activitySignalsUpdatedPrefix: string;
  activitySignalsBasedOnPrefix: string;
  activityOfferRateLabel: string;
  activityResponseMedianLabel: string;
  activityUnansweredLabel: string;
  activityCancellationLabel: string;
  activityCompletedLabel: string;
  activityAverageOrderValueLabel: string;
  activityGmvLabel: string;
  activityRevenueLabel: string;
  activityNoResponse: string;
  activityMinutesShortLabel: string;
  activityTakeRateSuffix: string;
  activityOfferRateHintPositive: string;
  activityOfferRateHintNegative: string;
  activityResponseFirstOfferHint: string;
  activityResponseActionHint: string;
  activityUnansweredRiskHint: string;
  activityCancellationStableHint: string;
  activityCancellationUnstableHint: string;
  activityCompletedSignalHint: string;
  activityRevenueSignalTemplate: string;
  trendStableLabel: string;
  trendNewTemplate: string;
  trendSinceLastPeriodTemplate: string;
  trendContextTodayLabel: string;
  trendContextWeekLabel: string;
  trendContextMonthLabel: string;
  trendContext90DaysLabel: string;
  reviewSingularLabel: string;
  reviewPluralLabel: string;
  insightMetricRequestsLabel: string;
  insightMetricProvidersLabel: string;
  insightMetricRatioLabel: string;
  insightMetricShareLabel: string;
  insightMetricResponseTimeLabel: string;
  insightMetricSuccessRateLabel: string;
  insightMetricProfileLabel: string;
  insightMetricProviderSearchesLabel: string;
  insightMetricUnansweredLabel: string;
  demandTitle: string;
  demandSubtitle: string;
  demandExpandListLabel: string;
  citiesTitle: string;
  citiesSubtitle: string;
  citiesColumnRank: string;
  citiesColumnCity: string;
  citiesColumnRequests: string;
  citiesColumnJobSearches: string;
  citiesColumnProviderSearches: string;
  citiesColumnMarketBalance: string;
  citiesFilterPlaceholder: string;
  citiesNoMatch: string;
  citiesExpandListLabel: string;
  citiesCollapseListLabel: string;
  citySignalHigh: string;
  citySignalMedium: string;
  citySignalLow: string;
  citySignalNone: string;
  opportunityTitle: string;
  opportunitySubtitle: string;
  opportunityEmpty: string;
  opportunityScoreLabel: string;
  opportunityDemandLabel: string;
  opportunityProvidersLabel: string;
  opportunityBalanceLabel: string;
  opportunityToneVeryHigh: string;
  opportunityToneHigh: string;
  opportunityToneBalanced: string;
  opportunityToneSupplyHeavy: string;
  opportunityAxisDemand: string;
  opportunityAxisCompetition: string;
  opportunityAxisGrowth: string;
  opportunityAxisActivity: string;
  opportunitySemanticVeryHigh: string;
  opportunitySemanticHigh: string;
  opportunitySemanticNoticeable: string;
  opportunitySemanticMedium: string;
  opportunitySemanticLow: string;
  opportunitySummaryVeryHigh: string;
  opportunitySummaryGood: string;
  opportunitySummaryBalancedCompetitive: string;
  opportunitySummaryBalanced: string;
  opportunitySummaryCompetitive: string;
  opportunitySummaryLowDemand: string;
  opportunitySummaryLow: string;
  opportunityStatusVeryHigh: string;
  opportunityStatusGood: string;
  opportunityStatusBalanced: string;
  opportunityStatusCompetitive: string;
  opportunityStatusLow: string;
  opportunityWhyLabel: string;
  priceTitle: string;
  priceSubtitle: string;
  priceGeneratedLabel: string;
  priceRadarLabel: string;
  pricePositionLabel: string;
  priceOpportunityZoneLabel: string;
  priceOpportunityHint: string;
  pricePositionLowLabel: string;
  pricePositionHighLabel: string;
  priceMarketAverageLabel: string;
  priceRecommendedLabel: string;
  priceRecommendationLabel: string;
  priceSweetSpotLabel: string;
  priceProfitPotentialLabel: string;
  priceProfitHighLabel: string;
  priceProfitMediumLabel: string;
  priceProfitLowLabel: string;
  priceStrategyButtonLabel: string;
  priceStrategyCloseLabel: string;
  priceStrategyLoadingLabel: string;
  priceStrategyLoadingBody: string;
  priceStrategyTitle: string;
  priceStrategyWhyLabel: string;
  priceStrategyWhyTemplate: string;
  priceStrategyObservationLabel: string;
  priceStrategyObservationTemplate: string;
  priceStrategyActionLabel: string;
  priceStrategyActionTemplate: string;
  priceStrategyPremiumLabel: string;
  priceStrategyPremiumTemplate: string;
  priceStrategyEntryLabel: string;
  priceStrategyGrowthLabel: string;
  priceStrategyScaleLabel: string;
  priceStrategyEntryDescription: string;
  priceStrategyGrowthDescription: string;
  priceStrategyScaleDescription: string;
  priceRecommendationFallbackTemplate: string;
  priceSignalLabel: string;
  priceGuidanceNote: string;
  priceNoData: string;
  profileTitle: string;
  profileRevenueLabel: string;
  profileSubtitlePlatform: string;
  profileSubtitlePersonalized: string;
  profileComparisonHeadline: string;
  profileStrengthLabel: string;
  profileMainLossLabel: string;
  profileRecommendationLineLabel: string;
  profileSummaryFallback: string;
  comparisonUserLabel: string;
  comparisonMarketLabel: string;
  comparisonGapLabel: string;
  clientActivityChartLabel: string;
  providerActivityChartLabel: string;
  insightsGeneratedLabel: string;
  insightsAssistantAvatarLabel: string;
  insightsAssistantName: string;
  insightsAssistantNote: string;
  insightsTypeChanceLabel: string;
  insightsTypeTrendLabel: string;
  insightsTypeRiskLabel: string;
  insightsTypeActionLabel: string;
  insightsTypeSignalLabel: string;
  insightsFeaturedLabel: string;
  insightsFeaturedActionLabel: string;
  decisionWhyLabel: string;
  decisionNextStepsLabel: string;
  decisionStrategyTitle: string;
  decisionStrategyCloseLabel: string;
  decisionStrategyLoadingLabel: string;
  decisionStrategyLoadingBody: string;
  decisionApplyStrategyLabel: string;
  decisionOpenRequestsLabel: string;
  decisionReasonMarketBalanceTemplate: string;
  decisionReasonDemandProvidersTemplate: string;
  decisionReasonGrowth: string;
  decisionReasonActivity: string;
  decisionReasonDemand: string;
  decisionReasonPriceCorridorTemplate: string;
  decisionSummaryFallback: string;
  decisionFocusStepTemplate: string;
  decisionFocusFallback: string;
  decisionPriceStepTemplate: string;
  decisionPriceFallback: string;
  decisionResponseTimeStep: string;
  personalizedDecisionSummaryFallback: string;
  userComparisonLabel: string;
  userDecisionSubtitle: string;
  userGapTitle: string;
  userGapSummaryTemplate: string;
  userAtMarketLevelLabel: string;
  userPositionTitle: string;
  userPositionSubtitle: string;
  userPositionTopPrefix: string;
  userPositionTopSuffix: string;
  userPositionAverageLabel: string;
  userPositionBelowLabel: string;
  userPositionSummaryTemplate: string;
  userPositionSummaryFallback: string;
  userPositionOverallLabel: string;
  userPositionCategoryLabel: string;
  userPositionCityLabel: string;
  userRisksTitle: string;
  userRisksSubtitle: string;
  userOpportunitiesTitle: string;
  userOpportunitiesSubtitle: string;
  userActionsTitle: string;
  userActionsSubtitle: string;
  userActionsEmpty: string;
  userRiskSeverityHigh: string;
  userRiskSeverityMedium: string;
  userRiskSeverityLow: string;
  userRiskSlowResponseTitle: string;
  userRiskSlowResponseBody: string;
  userRiskUnansweredTitle: string;
  userRiskUnansweredBody: string;
  userRiskVisibilityTitle: string;
  userRiskVisibilityBody: string;
  userOpportunityDemandTitle: string;
  userOpportunityDemandBody: string;
  userOpportunityCompetitionTitle: string;
  userOpportunityCompetitionBody: string;
  userOpportunityCategoryTitle: string;
  userOpportunityCategoryBody: string;
  userPricingCurrentLabel: string;
  userPricingProfileLabel: string;
  userPricingRecommendedLabel: string;
  userPricingAverageLabel: string;
  userPricingSummary: string;
  userPricingStatusAbove: string;
  userPricingStatusBelow: string;
  userPricingStatusWithin: string;
  userPricingStatusUnknown: string;
  userPricingPositionLabel: string;
  userPricingEffectLabel: string;
  userPricingEffectAbove: string;
  userPricingEffectBelow: string;
  userPricingEffectWithin: string;
  userPricingEffectUnknown: string;
  userForYouLabel: string;
  userFitLabel: string;
  userFitHighLabel: string;
  userRecommendationLabel: string;
  userRecommendationReliabilityHigh: string;
  userRecommendationReliabilityMedium: string;
  userRecommendationReliabilityLow: string;
  userActionPriorityHigh: string;
  userActionPriorityMedium: string;
  userActionPriorityLow: string;
  userActionImpactLabel: string;
  userActionEffectLabel: string;
  userActionImpactHigh: string;
  userActionImpactMedium: string;
  userActionImpactLow: string;
  userActionRespondTitle: string;
  userActionRespondDetail: string;
  userActionRespondEffect: string;
  userActionPriceTitle: string;
  userActionPriceDetail: string;
  userActionPriceEffect: string;
  userActionFocusTitle: string;
  userActionFocusDetail: string;
  userActionFocusEffect: string;
  userActionProfileTitle: string;
  userActionProfileDetail: string;
  userActionProfileEffect: string;
  userActionFollowUpTitle: string;
  userActionFollowUpDetail: string;
  userActionFollowUpEffect: string;
  growthTitle: string;
  growthSubtitle: string;
  growthRecommendedPrefix: string;
  growthFeaturedBadge: string;
  growthPriorityHigh: string;
  growthHeroVisibilityTitle: string;
  growthHeroVisibilityTitleWithContext: string;
  growthExpectedEffectLabel: string;
  growthPositionTitle: string;
  growthVisibilityLabel: string;
  growthVisibilityLow: string;
  growthResponseLabel: string;
  growthResponseMedium: string;
  growthWhyNowTitle: string;
  growthDemandInContext: string;
  growthDemandGeneric: string;
  growthMarketChanceCurrent: string;
  growthVisibilityBelowAverage: string;
  growthFocusLabel: string;
  growthDemandLabel: string;
  growthDemandHighValue: string;
  growthCompetitionLabel: string;
  growthCompetitionMedium: string;
  growthConversionLabel: string;
  growthConversionOptimizable: string;
  growthMarketCompareLabel: string;
  growthMarketCompareAvailable: string;
  growthHighlightCta: string;
  growthLocalAdsCta: string;
  growthPremiumCta: string;
  growthNextStepsTitle: string;
  growthNextStepVisibility: string;
  growthNextStepLocalAds: string;
  growthNextStepLocalAdsWithContext: string;
  growthNextStepPricing: string;
  kpiSuccessRateLabel: string;
  kpiNoCompletedJobs: string;
  kpiActiveProvidersLabel: string;
  kpiActiveRequestsHintSuffix: string;
  kpiActiveCitiesLabel: string;
  kpiWithDemandHint: string;
  kpiAverageRatingLabel: string;
  kpiNoOpenRequests: string;
  kpiTotalInRangeHintSuffix: string;
  kpiLast7DaysHintSuffix: string;
  kpiNoRecentOffers7d: string;
  kpiResponseTimeLabel: string;
  kpiNoResponseTimeData: string;
  kpiFastResponseHint: string;
  kpiResponseTargetHint: string;
  kpiAcceptedOffersHintSuffix: string;
  kpiNoSentOffers: string;
  kpiProfileCompletenessLabel: string;
  kpiStrongProfileHint: string;
  kpiImproveProfileHint: string;
  emptyDemand: string;
  emptyCities: string;
  emptyInsights: string;
  emptyActivity: string;
  fallbackGeneralCategoryLabel: string;
  peakLabel: string;
  bestWindowLabel: string;
  updatedLabel: string;
  requestsLabel: string;
  offersLabel: string;
  reviewsLabel: string;
  stage1LabelPlatform: string;
  stage2LabelPlatform: string;
  stage3LabelPlatform: string;
  stage4LabelPlatform: string;
  stage1LabelPersonalized: string;
  stage2LabelPersonalized: string;
  stage3LabelPersonalized: string;
  stage4LabelPersonalized: string;
  funnelRequestsLabel: string;
  funnelRequestsCompactLabel: string;
  funnelOffersLabel: string;
  funnelOffersCompactLabel: string;
  funnelConfirmedLabel: string;
  funnelConfirmedCompactLabel: string;
  funnelClosedLabel: string;
  funnelClosedCompactLabel: string;
  funnelCompletedLabel: string;
  funnelCompletedCompactLabel: string;
  funnelProfitLabel: string;
  funnelProfitCompactLabel: string;
  funnelRateOfferLabel: string;
  funnelRateConfirmationLabel: string;
  funnelRateClosureLabel: string;
  funnelRateCompletionLabel: string;
  funnelRateAvgRevenueLabel: string;
  funnelSummaryPrefix: string;
  funnelSummaryMiddle: string;
  funnelSummarySuffix: string;
  funnelDropoffLabel: string;
  funnelEmptyTitle: string;
  funnelEmptyBody: string;
  funnelError: string;
  conversionLabel: string;
  growthCta: string;
};

export function getWorkspaceStatisticsCopy(locale: Locale): WorkspaceStatisticsCopy {
  return locale === 'de' ? COPY_DE : COPY_EN;
}

export function resolveInsightText(copy: WorkspaceStatisticsCopy, insight: WorkspaceStatisticsInsightDto): string {
  const backendBody = insight.body?.trim();
  if (backendBody) return backendBody;

  const context = insight.context?.trim() || '';

  switch (insight.code) {
    case 'profile_incomplete':
      return copy === COPY_DE
        ? `Dein Profil ist nur zu ${context || '0'}% vollständig. Vollständige Profile werden häufiger angefragt.`
        : `Your profile is only ${context || '0'}% complete. Complete profiles get requested more often.`;
    case 'low_success_rate':
      return copy === COPY_DE
        ? `Deine Erfolgsquote liegt bei ${context || '0'}%. Prüfe Preis und Angebotsnachricht.`
        : `Your success rate is ${context || '0'}%. Review pricing and offer messaging.`;
    case 'strong_response_time':
      return copy === COPY_DE
        ? `Starke Antwortzeit (${context || '0'} Min.). Halte diesen Rhythmus für mehr Abschlüsse.`
        : `Strong response time (${context || '0'} min). Keep this pace for higher win rates.`;
    case 'slow_response_time':
      return copy === COPY_DE
        ? `Deine Antwortzeit liegt bei ${context || '0'} Min. Schnellere Antworten verbessern die Conversion.`
        : `Your response time is ${context || '0'} min. Faster replies improve conversion.`;
    case 'top_category_demand':
    case 'high_category_demand':
      return copy === COPY_DE
        ? `Die Kategorie ${context || '—'} zeigt aktuell besonders hohe Nachfrage.`
        : `Category ${context || '—'} currently shows strong demand.`;
    case 'top_city_demand':
      return copy === COPY_DE
        ? `In ${context || 'dieser Stadt'} ist die Nachfrage aktuell am höchsten.`
        : `Demand is currently highest in ${context || 'this city'}.`;
    case 'city_opportunity_high':
      return copy === COPY_DE
        ? `In ${context || 'dieser Stadt'} gibt es aktuell mehr Nachfrage als Anbieter.`
        : `${context || 'This city'} currently has more demand than active providers.`;
    case 'category_opportunity_high':
      return copy === COPY_DE
        ? `In ${context || 'dieser Kategorie'} können Anbieter aktuell schneller Aufträge finden.`
        : `Providers can currently find jobs faster in ${context || 'this category'}.`;
    case 'local_ads_opportunity':
      return copy === COPY_DE
        ? `Lokale Sichtbarkeit kann in ${context || 'dieser Stadt'} aktuell besonders wirksam sein.`
        : `Local promotion can be especially effective in ${context || 'this city'} right now.`;
    case 'best_market_chance':
      return copy === COPY_DE
        ? `${context || 'Diese Region'} zeigt aktuell die beste Kombination aus Nachfrage und geringer Konkurrenz.`
        : `${context || 'This area'} currently shows the best balance of demand and low competition.`;
    case 'high_completion_rate':
      return copy === COPY_DE
        ? 'Nach Vertragsabschluss werden deine Aufträge sehr häufig erfolgreich abgeschlossen.'
        : 'After contract confirmation, your jobs are completed successfully at a high rate.';
    default:
      return copy === COPY_DE
        ? 'Noch nicht genug Daten für eine konkrete Empfehlung.'
        : 'Not enough data yet for a specific recommendation.';
  }
}

export function resolveGrowthCard(
  copy: WorkspaceStatisticsCopy,
  card: WorkspaceStatisticsGrowthCardDto,
): {
  title: string;
  body: string;
  href: string;
  benefit: string;
  tone: 'primary' | 'default';
  badge?: string;
} {
  if (card.key === 'highlight_profile') {
    return {
      title: copy === COPY_DE ? 'Profil hervorheben' : 'Boost profile visibility',
      body: copy === COPY_DE
        ? 'Mehr passende Anfragen durch bessere Positionierung in einem Markt mit aktiver Nachfrage.'
        : 'More relevant requests through stronger positioning in an active market.',
      benefit: copy === COPY_DE ? '+18–40 % Profilaufrufe' : '+18–40% profile views',
      tone: 'primary',
      href: card.href,
    };
  }
  if (card.key === 'local_ads') {
    return {
      title: copy === COPY_DE ? 'Lokale Werbung' : 'Local promotion',
      body: copy === COPY_DE
        ? 'Mehr Reichweite in Städten mit aktiver Nachfrage.'
        : 'More reach in cities with active demand.',
      benefit: copy === COPY_DE ? 'Mehr Reichweite im Fokusmarkt' : 'More reach in the focus market',
      tone: 'default',
      href: card.href,
    };
  }
  return {
    title: copy === COPY_DE ? 'Markt-Insights & Conversion-Analyse' : 'Market insights & conversion analysis',
    body: copy === COPY_DE
      ? 'Erkenne, warum Anfragen nicht zu Aufträgen werden, und verbessere deine Entscheidungen.'
      : 'See why requests do not turn into jobs and improve your decisions.',
    benefit: copy === COPY_DE
      ? 'Klarere Entscheidungen im Marktvergleich'
      : 'Clearer decisions with market comparison',
    tone: 'default',
    badge: copy === COPY_DE ? 'Beta' : 'Beta',
    href: card.href,
  };
}
