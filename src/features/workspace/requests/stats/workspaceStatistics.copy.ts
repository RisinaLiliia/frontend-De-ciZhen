import type { WorkspaceStatisticsGrowthCardDto, WorkspaceStatisticsInsightDto } from '@/lib/api/dto/workspace';
import type { Locale } from '@/lib/i18n/t';

export type WorkspaceStatisticsCopy = {
  subtitle: string;
  rangeGroupLabel: string;
  range24h: string;
  range7d: string;
  range30d: string;
  range90d: string;
  exportLabel: string;
  modePlatform: string;
  modePersonalized: string;
  kpiTitle: string;
  activityTitle: string;
  activitySubtitle: string;
  activitySignalsTitle: string;
  activitySignalsSubtitle: string;
  activityOfferRateLabel: string;
  activityResponseMedianLabel: string;
  activityUnansweredLabel: string;
  activityCancellationLabel: string;
  activityCompletedLabel: string;
  activityGmvLabel: string;
  activityRevenueLabel: string;
  activityNoResponse: string;
  activityTakeRateSuffix: string;
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
  priceTitle: string;
  priceSubtitle: string;
  priceGeneratedLabel: string;
  priceRadarLabel: string;
  priceMarketAverageLabel: string;
  priceRecommendedLabel: string;
  priceRecommendationLabel: string;
  priceSweetSpotLabel: string;
  priceProfitPotentialLabel: string;
  priceProfitHighLabel: string;
  priceProfitMediumLabel: string;
  priceProfitLowLabel: string;
  priceStrategyButtonLabel: string;
  priceStrategyHideButtonLabel: string;
  priceStrategyTitle: string;
  priceStrategyWhyLabel: string;
  priceStrategyWhyTemplate: string;
  priceStrategyObservationLabel: string;
  priceStrategyObservationTemplate: string;
  priceStrategyActionLabel: string;
  priceStrategyActionTemplate: string;
  priceStrategyPremiumLabel: string;
  priceStrategyPremiumTemplate: string;
  priceSignalLabel: string;
  priceGuidanceNote: string;
  priceNoData: string;
  profileTitle: string;
  profileRevenueLabel: string;
  profileSubtitlePlatform: string;
  profileSubtitlePersonalized: string;
  insightsTitle: string;
  insightsSubtitle: string;
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
  growthTitle: string;
  growthSubtitle: string;
  growthRecommendedPrefix: string;
  growthFeaturedBadge: string;
  emptyDemand: string;
  emptyCities: string;
  emptyInsights: string;
  emptyActivity: string;
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
  funnelEmptyTitle: string;
  funnelEmptyBody: string;
  funnelError: string;
  conversionLabel: string;
  growthCta: string;
};

const COPY_DE: WorkspaceStatisticsCopy = {
  subtitle: 'Überblick über Performance, Nachfrage und Wachstum',
  rangeGroupLabel: 'Zeitraum',
  range24h: '24h',
  range7d: '7 Tage',
  range30d: '30 Tage',
  range90d: '90 Tage',
  exportLabel: 'Export CSV',
  modePlatform: 'Plattform',
  modePersonalized: 'Personalisiert',
  kpiTitle: 'KPI Übersicht',
  activityTitle: 'Aktivität der Plattform',
  activitySubtitle: 'Neue Anfragen und Angebote im Zeitverlauf',
  activitySignalsTitle: 'Decision Layer',
  activitySignalsSubtitle: 'Operative Kennzahlen für Markt- und Wachstumsentscheidungen',
  activityOfferRateLabel: 'Angebotsquote',
  activityResponseMedianLabel: 'Median Antwortzeit',
  activityUnansweredLabel: 'Unbeantwortet >24h',
  activityCancellationLabel: 'Stornoquote',
  activityCompletedLabel: 'Abschlüsse',
  activityGmvLabel: 'GMV',
  activityRevenueLabel: 'Plattform-Umsatz',
  activityNoResponse: 'Keine Antwortdaten',
  activityTakeRateSuffix: 'Take Rate',
  demandTitle: 'Nachfrage nach Kategorien',
  demandSubtitle: 'Wo aktuell die meisten Aufträge entstehen',
  demandExpandListLabel: 'Alle Kategorien anzeigen',
  citiesTitle: 'Städte & Regionen',
  citiesSubtitle: 'Marktaktivität nach Stadt im gewählten Zeitraum',
  citiesColumnRank: 'Rang',
  citiesColumnCity: 'Stadt',
  citiesColumnRequests: 'Anfragen',
  citiesColumnJobSearches: 'Auftrags-Suchen',
  citiesColumnProviderSearches: 'Anbieter-Suchen',
  citiesColumnMarketBalance: 'Market Balance',
  citiesFilterPlaceholder: 'Stadt suchen',
  citiesNoMatch: 'Keine Stadt gefunden.',
  citiesExpandListLabel: 'Alle Städte anzeigen',
  citiesCollapseListLabel: 'Liste reduzieren',
  citySignalHigh: 'Hohe Nachfrage',
  citySignalMedium: 'Ausgeglichen',
  citySignalLow: 'Viele Anbieter',
  citySignalNone: 'Kein Suchsignal',
  opportunityTitle: 'Opportunity Radar',
  opportunitySubtitle: 'Beste Marktchancen',
  opportunityEmpty: 'Noch keine Chancen-Daten verfügbar.',
  opportunityScoreLabel: 'Chance Score',
  opportunityDemandLabel: 'Nachfrage',
  opportunityProvidersLabel: 'Anbieter',
  opportunityBalanceLabel: 'Marktbalance',
  opportunityToneVeryHigh: 'Sehr hohe Nachfrage',
  opportunityToneHigh: 'Hohe Nachfrage',
  opportunityToneBalanced: 'Ausgeglichen',
  opportunityToneSupplyHeavy: 'Viele Anbieter',
  opportunityAxisDemand: 'Nachfrage',
  opportunityAxisCompetition: 'Konkurrenz',
  opportunityAxisGrowth: 'Marktwachstum',
  opportunityAxisActivity: 'Marktaktivität',
  opportunitySemanticVeryHigh: 'Sehr hoch',
  opportunitySemanticHigh: 'Hoch',
  opportunitySemanticNoticeable: 'Spürbar',
  opportunitySemanticMedium: 'Mittel',
  opportunitySemanticLow: 'Niedrig',
  opportunitySummaryVeryHigh:
    'Sehr hohe Nachfrage bei kontrollierbarem Wettbewerb. Jetzt ist ein starker Moment, um Sichtbarkeit in dieser Kategorie auszubauen.',
  opportunitySummaryGood:
    'Solide Nachfrage mit guter Marktaktivität. Mit klarer Positionierung kannst du hier zügig neue Aufträge gewinnen.',
  opportunitySummaryBalancedCompetitive:
    'Hohe Nachfrage trifft aktuell auf starken Wettbewerb. Gute Chancen haben Anbieter mit klarer Spezialisierung oder besserer Sichtbarkeit.',
  opportunitySummaryBalanced:
    'Die Marktchance ist ausgeglichen. Mit sauberem Profil und schnellen Reaktionen lässt sich diese Region effizient bedienen.',
  opportunitySummaryCompetitive:
    'Der Wettbewerb ist deutlich spürbar und drückt die Chance. Fokus auf Differenzierung und Preisstrategie verbessert die Abschlusswahrscheinlichkeit.',
  opportunitySummaryLowDemand:
    'Aktuell ist die Nachfrage in diesem Segment begrenzt. Prüfe Alternativen mit stärkerem Wachstum oder niedrigerem Wettbewerbsdruck.',
  opportunitySummaryLow:
    'Die Opportunity ist derzeit niedrig. Neue Chancen entstehen meist mit zusätzlicher Nachfrage oder besserer Marktaktivität.',
  priceTitle: 'Preis-Intelligenz',
  priceSubtitle: 'Empfohlene Preisbereiche',
  priceGeneratedLabel: 'Basierend auf aktuellen Auftragsdaten',
  priceRadarLabel: 'Marktpreis-Radar',
  priceMarketAverageLabel: 'Marktdurchschnitt',
  priceRecommendedLabel: 'Empfohlener Bereich',
  priceRecommendationLabel: 'Empfehlung',
  priceSweetSpotLabel: 'Optimale Zone',
  priceProfitPotentialLabel: 'Profit Potential',
  priceProfitHighLabel: 'Sehr gute Marktchance',
  priceProfitMediumLabel: 'Solide Marktchance',
  priceProfitLowLabel: 'Vorsichtige Marktchance',
  priceStrategyButtonLabel: 'Preisstrategie anzeigen',
  priceStrategyHideButtonLabel: 'Strategie ausblenden',
  priceStrategyTitle: 'Preisstrategie',
  priceStrategyWhyLabel: 'Warum dieser Bereich funktioniert',
  priceStrategyWhyTemplate: '{range} erzielt aktuell die höchste Abschlussrate{citySuffix}.',
  priceStrategyObservationLabel: 'Marktbeobachtung',
  priceStrategyObservationTemplate:
    'Viele Anbieter orientieren sich am Marktdurchschnitt von {average}. Angebote nahe {range} werden aktuell häufiger ausgewählt.',
  priceStrategyActionLabel: 'Handlungsempfehlung',
  priceStrategyActionTemplate:
    'Positioniere dein Angebot leicht unter oder nahe dem Marktdurchschnitt, antworte schnell und betone klare Profilvorteile.',
  priceStrategyPremiumLabel: 'Wann höher funktionieren kann',
  priceStrategyPremiumTemplate:
    'Ein Preis oberhalb des empfohlenen Korridors funktioniert besser, wenn dein Profil starke Bewertungen, schnelle Antwortzeiten und klaren Premium-Service zeigt.',
  priceSignalLabel: 'Preis Signal',
  priceGuidanceNote: 'Orientierung für neue Angebote im gewählten Zeitraum.',
  priceNoData: 'Noch keine Preisdaten verfügbar.',
  profileTitle: 'Profil Performance',
  profileRevenueLabel: 'Umsatz',
  profileSubtitlePlatform: 'Von Anfragen bis zum erfolgreichen Abschluss und Umsatz',
  profileSubtitlePersonalized: 'Wie dein Profil aktuell performt',
  insightsTitle: 'Handlungsempfehlungen',
  insightsSubtitle: 'KI-gestützte Hinweise für bessere Entscheidungen',
  insightsGeneratedLabel: 'Basierend auf aktuellen Plattformdaten',
  insightsAssistantAvatarLabel: 'KI',
  insightsAssistantName: "De'ci KI",
  insightsAssistantNote: 'Priorisiert Chancen, Risiken und nächste Schritte',
  insightsTypeChanceLabel: 'Chance',
  insightsTypeTrendLabel: 'Trend',
  insightsTypeRiskLabel: 'Risiko',
  insightsTypeActionLabel: 'Aktion',
  insightsTypeSignalLabel: 'Signal',
  insightsFeaturedLabel: 'Priorität',
  insightsFeaturedActionLabel: 'Mehr Details',
  growthTitle: 'Wachstum & Promotion',
  growthSubtitle: 'Tools für mehr Sichtbarkeit und neue Aufträge',
  growthRecommendedPrefix: 'Empfohlen für',
  growthFeaturedBadge: 'Empfohlen',
  emptyDemand: 'Noch keine Kategoriedaten für diesen Zeitraum.',
  emptyCities: 'Noch keine Städtedaten verfügbar.',
  emptyInsights: 'Noch keine Insights verfügbar.',
  emptyActivity: 'Noch keine Aktivitätsdaten.',
  peakLabel: 'Höchster Aktivitätspunkt',
  bestWindowLabel: 'Bestes Zeitfenster',
  updatedLabel: 'Letzte Aktualisierung',
  requestsLabel: 'Anfragen',
  offersLabel: 'Angebote',
  reviewsLabel: 'Bewertungen',
  stage1LabelPlatform: 'Anfragen',
  stage2LabelPlatform: 'Angebote',
  stage3LabelPlatform: 'Abschlüsse',
  stage4LabelPlatform: 'Abgeschlossene Aufträge',
  stage1LabelPersonalized: 'Offene Anfragen',
  stage2LabelPersonalized: 'Gesendete Angebote',
  stage3LabelPersonalized: 'Akzeptierte Angebote',
  stage4LabelPersonalized: 'Abgeschlossene Aufträge',
  funnelRequestsLabel: 'Anfragen',
  funnelRequestsCompactLabel: 'Anfragen',
  funnelOffersLabel: 'Angebote von Anbietern',
  funnelOffersCompactLabel: 'Angebote',
  funnelConfirmedLabel: 'Bestätigte Rückmeldungen',
  funnelConfirmedCompactLabel: 'Rückmeldungen',
  funnelClosedLabel: 'Geschlossene Verträge',
  funnelClosedCompactLabel: 'Verträge',
  funnelCompletedLabel: 'Erfolgreich abgeschlossen',
  funnelCompletedCompactLabel: 'Abgeschlossen',
  funnelProfitLabel: 'Gewinnsumme',
  funnelProfitCompactLabel: 'Gewinn',
  funnelRateOfferLabel: 'Antwortquote',
  funnelRateConfirmationLabel: 'Zustimmungsrate',
  funnelRateClosureLabel: 'Abschlussrate',
  funnelRateCompletionLabel: 'Erfüllungsquote',
  funnelRateAvgRevenueLabel: 'Ø Umsatz / Auftrag',
  funnelSummaryPrefix: 'Von',
  funnelSummaryMiddle: 'Anfragen wurden',
  funnelSummarySuffix: 'erfolgreich abgeschlossen.',
  funnelEmptyTitle: 'Noch keine Funnel-Daten verfügbar',
  funnelEmptyBody:
    'Sobald erste Anfragen, Angebote und Abschlüsse vorliegen, erscheint hier deine Performance über die Plattform.',
  funnelError: 'Die Funnel-Daten konnten nicht geladen werden. Bitte versuche es später erneut.',
  conversionLabel: 'Conversion',
  growthCta: 'Mehr entdecken',
};

const COPY_EN: WorkspaceStatisticsCopy = {
  subtitle: 'Overview of performance, demand, and growth',
  rangeGroupLabel: 'Time range',
  range24h: '24h',
  range7d: '7 days',
  range30d: '30 days',
  range90d: '90 days',
  exportLabel: 'Export CSV',
  modePlatform: 'Platform',
  modePersonalized: 'Personalized',
  kpiTitle: 'KPI overview',
  activityTitle: 'Platform activity',
  activitySubtitle: 'New requests and offers over time',
  activitySignalsTitle: 'Decision layer',
  activitySignalsSubtitle: 'Operational metrics for market and growth decisions',
  activityOfferRateLabel: 'Offer rate',
  activityResponseMedianLabel: 'Median response time',
  activityUnansweredLabel: 'Unanswered >24h',
  activityCancellationLabel: 'Cancellation rate',
  activityCompletedLabel: 'Completed jobs',
  activityGmvLabel: 'GMV',
  activityRevenueLabel: 'Platform revenue',
  activityNoResponse: 'No response data',
  activityTakeRateSuffix: 'Take rate',
  demandTitle: 'Demand by category',
  demandSubtitle: 'Where market demand is currently highest',
  demandExpandListLabel: 'Show all categories',
  citiesTitle: 'Cities & regions',
  citiesSubtitle: 'Market activity by city in selected range',
  citiesColumnRank: 'Rank',
  citiesColumnCity: 'City',
  citiesColumnRequests: 'Requests',
  citiesColumnJobSearches: 'Job searches',
  citiesColumnProviderSearches: 'Provider searches',
  citiesColumnMarketBalance: 'Market balance',
  citiesFilterPlaceholder: 'Search city',
  citiesNoMatch: 'No matching city found.',
  citiesExpandListLabel: 'Show all cities',
  citiesCollapseListLabel: 'Show fewer',
  citySignalHigh: 'High demand',
  citySignalMedium: 'Balanced',
  citySignalLow: 'High provider activity',
  citySignalNone: 'No search signal',
  opportunityTitle: 'Opportunity radar',
  opportunitySubtitle: 'Best market opportunities',
  opportunityEmpty: 'No opportunity data available yet.',
  opportunityScoreLabel: 'Chance score',
  opportunityDemandLabel: 'Demand',
  opportunityProvidersLabel: 'Providers',
  opportunityBalanceLabel: 'Market balance',
  opportunityToneVeryHigh: 'Very high demand',
  opportunityToneHigh: 'High demand',
  opportunityToneBalanced: 'Balanced',
  opportunityToneSupplyHeavy: 'High provider activity',
  opportunityAxisDemand: 'Demand',
  opportunityAxisCompetition: 'Competition',
  opportunityAxisGrowth: 'Market growth',
  opportunityAxisActivity: 'Market activity',
  opportunitySemanticVeryHigh: 'Very high',
  opportunitySemanticHigh: 'High',
  opportunitySemanticNoticeable: 'Noticeable',
  opportunitySemanticMedium: 'Medium',
  opportunitySemanticLow: 'Low',
  opportunitySummaryVeryHigh:
    'Demand is very high while competition stays manageable. This is a strong moment to increase visibility in this category.',
  opportunitySummaryGood:
    'Stable demand and healthy market activity create good momentum. A clear positioning can help you win new jobs quickly.',
  opportunitySummaryBalancedCompetitive:
    'Strong demand currently meets strong competition. Best chances come from sharper specialization and stronger visibility.',
  opportunitySummaryBalanced:
    'The market is balanced right now. A strong profile and fast response times can unlock consistent opportunities.',
  opportunitySummaryCompetitive:
    'Competition pressure is high and limits upside. Better differentiation and pricing strategy can improve conversion.',
  opportunitySummaryLowDemand:
    'Demand in this segment is currently limited. Consider alternatives with stronger growth or lower competitive pressure.',
  opportunitySummaryLow:
    'Opportunity is currently low. Better demand or higher market activity is needed before scaling efforts here.',
  priceTitle: 'Price intelligence',
  priceSubtitle: 'Recommended price ranges',
  priceGeneratedLabel: 'Based on current order data',
  priceRadarLabel: 'Market price radar',
  priceMarketAverageLabel: 'Market average',
  priceRecommendedLabel: 'Recommended range',
  priceRecommendationLabel: 'Recommendation',
  priceSweetSpotLabel: 'Optimal zone',
  priceProfitPotentialLabel: 'Profit potential',
  priceProfitHighLabel: 'Strong market potential',
  priceProfitMediumLabel: 'Solid market potential',
  priceProfitLowLabel: 'Cautious market potential',
  priceStrategyButtonLabel: 'Show pricing strategy',
  priceStrategyHideButtonLabel: 'Hide strategy',
  priceStrategyTitle: 'Pricing strategy',
  priceStrategyWhyLabel: 'Why this range works',
  priceStrategyWhyTemplate: '{range} currently shows the highest close rate{citySuffix}.',
  priceStrategyObservationLabel: 'Market observation',
  priceStrategyObservationTemplate:
    'Many providers cluster near the market average of {average}. Offers close to {range} are currently selected more often.',
  priceStrategyActionLabel: 'Recommended action',
  priceStrategyActionTemplate:
    'Position your offer slightly below or close to market average, respond quickly, and highlight clear profile advantages.',
  priceStrategyPremiumLabel: 'When higher pricing can work',
  priceStrategyPremiumTemplate:
    'A price above the recommended corridor performs better when your profile has strong reviews, fast response, and clear premium service.',
  priceSignalLabel: 'Price signal',
  priceGuidanceNote: 'Reference range for new offers in the selected period.',
  priceNoData: 'No pricing data available yet.',
  profileTitle: 'Profile performance',
  profileRevenueLabel: 'Revenue',
  profileSubtitlePlatform: 'From requests to successful completion and revenue',
  profileSubtitlePersonalized: 'How your profile performs right now',
  insightsTitle: 'Action recommendations',
  insightsSubtitle: 'AI-guided signals for better decisions',
  insightsGeneratedLabel: 'Based on current platform data',
  insightsAssistantAvatarLabel: 'AI',
  insightsAssistantName: "De'ci AI",
  insightsAssistantNote: 'Prioritizing opportunities, risks, and next steps',
  insightsTypeChanceLabel: 'Chance',
  insightsTypeTrendLabel: 'Trend',
  insightsTypeRiskLabel: 'Risk',
  insightsTypeActionLabel: 'Action',
  insightsTypeSignalLabel: 'Signal',
  insightsFeaturedLabel: 'Priority',
  insightsFeaturedActionLabel: 'View details',
  growthTitle: 'Growth & promotion',
  growthSubtitle: 'Tools for more visibility and new jobs',
  growthRecommendedPrefix: 'Recommended for',
  growthFeaturedBadge: 'Recommended',
  emptyDemand: 'No category demand data for this range.',
  emptyCities: 'No city demand data yet.',
  emptyInsights: 'No insights available yet.',
  emptyActivity: 'No activity data yet.',
  peakLabel: 'Peak activity point',
  bestWindowLabel: 'Best time window',
  updatedLabel: 'Last updated',
  requestsLabel: 'Requests',
  offersLabel: 'Offers',
  reviewsLabel: 'Reviews',
  stage1LabelPlatform: 'Requests',
  stage2LabelPlatform: 'Offers',
  stage3LabelPlatform: 'Wins',
  stage4LabelPlatform: 'Completed jobs',
  stage1LabelPersonalized: 'Open requests',
  stage2LabelPersonalized: 'Sent offers',
  stage3LabelPersonalized: 'Accepted offers',
  stage4LabelPersonalized: 'Completed jobs',
  funnelRequestsLabel: 'Requests',
  funnelRequestsCompactLabel: 'Requests',
  funnelOffersLabel: 'Provider offers',
  funnelOffersCompactLabel: 'Offers',
  funnelConfirmedLabel: 'Confirmed responses',
  funnelConfirmedCompactLabel: 'Responses',
  funnelClosedLabel: 'Closed contracts',
  funnelClosedCompactLabel: 'Contracts',
  funnelCompletedLabel: 'Successfully completed',
  funnelCompletedCompactLabel: 'Completed',
  funnelProfitLabel: 'Profit amount',
  funnelProfitCompactLabel: 'Profit',
  funnelRateOfferLabel: 'Response rate',
  funnelRateConfirmationLabel: 'Approval rate',
  funnelRateClosureLabel: 'Closure rate',
  funnelRateCompletionLabel: 'Fulfillment rate',
  funnelRateAvgRevenueLabel: 'Avg revenue / job',
  funnelSummaryPrefix: 'From',
  funnelSummaryMiddle: 'requests,',
  funnelSummarySuffix: 'were successfully completed.',
  funnelEmptyTitle: 'No funnel data available yet',
  funnelEmptyBody:
    'As soon as first requests, offers, and completions are available, your platform performance will appear here.',
  funnelError: 'Funnel data could not be loaded. Please try again later.',
  conversionLabel: 'Conversion',
  growthCta: 'Discover more',
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
        ? 'Mehr Sichtbarkeit in der Suche für dein Profil.'
        : 'Get higher visibility in search and discovery.',
      benefit: copy === COPY_DE ? 'Bis zu 40% mehr Profilaufrufe' : 'Up to 40% more profile views',
      tone: 'primary',
      href: card.href,
    };
  }
  if (card.key === 'local_ads') {
    return {
      title: copy === COPY_DE ? 'Lokale Werbung' : 'Local promotion',
      body: copy === COPY_DE
        ? 'Dienste gezielt in aktiven Städten platzieren.'
        : 'Promote services in the most active cities.',
      benefit: copy === COPY_DE ? 'Mehr Anfragen aus deiner Region' : 'More requests from your region',
      tone: 'default',
      href: card.href,
    };
  }
  return {
    title: copy === COPY_DE ? 'Premium Anbieter Tools' : 'Premium provider tools',
    body: copy === COPY_DE
      ? 'Erweiterte Analyse und Reichweite für Wachstum.'
      : 'Unlock advanced analytics and reach tools.',
    benefit: copy === COPY_DE ? 'Erweiterte Markt-Insights' : 'Advanced market insights',
    tone: 'default',
    badge: copy === COPY_DE ? 'Beta' : 'Beta',
    href: card.href,
  };
}
