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
  cityCoverageFullLabel: string;
  cityCoveragePartialLabel: string;
  cityCoverageNoneLabel: string;
  profileTitle: string;
  profileSubtitlePlatform: string;
  profileSubtitlePersonalized: string;
  insightsTitle: string;
  growthTitle: string;
  growthSubtitle: string;
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
  cityCoverageFullLabel: 'Volle Suchsignale',
  cityCoveragePartialLabel: 'Teilweise Suchsignale',
  cityCoverageNoneLabel: 'Nur Nachfrage-Daten',
  profileTitle: 'Profil Performance',
  profileSubtitlePlatform: 'Markt-Funnel über die Plattform',
  profileSubtitlePersonalized: 'Wie dein Profil aktuell performt',
  insightsTitle: 'Empfehlungen & Insights',
  growthTitle: 'Wachstum & Promotion',
  growthSubtitle: 'Tools für mehr Sichtbarkeit und Reichweite',
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
  conversionLabel: 'Conversion',
  growthCta: 'Mehr erfahren',
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
  cityCoverageFullLabel: 'Full search signals',
  cityCoveragePartialLabel: 'Partial search signals',
  cityCoverageNoneLabel: 'Demand only data',
  profileTitle: 'Profile performance',
  profileSubtitlePlatform: 'Marketplace funnel for the platform',
  profileSubtitlePersonalized: 'How your profile performs right now',
  insightsTitle: 'Recommendations & insights',
  growthTitle: 'Growth & promotion',
  growthSubtitle: 'Tools for better visibility and reach',
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
  conversionLabel: 'Conversion',
  growthCta: 'Learn more',
};

export function getWorkspaceStatisticsCopy(locale: Locale): WorkspaceStatisticsCopy {
  return locale === 'de' ? COPY_DE : COPY_EN;
}

export function resolveInsightText(copy: WorkspaceStatisticsCopy, insight: WorkspaceStatisticsInsightDto): string {
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
    case 'high_category_demand':
      return copy === COPY_DE
        ? `Die Kategorie ${context || '—'} zeigt aktuell besonders hohe Nachfrage.`
        : `Category ${context || '—'} currently shows strong demand.`;
    case 'top_city_demand':
      return copy === COPY_DE
        ? `In ${context || 'dieser Stadt'} ist die Nachfrage aktuell am höchsten.`
        : `Demand is currently highest in ${context || 'this city'}.`;
    default:
      return copy === COPY_DE
        ? 'Noch nicht genug Daten für eine konkrete Empfehlung.'
        : 'Not enough data yet for a specific recommendation.';
  }
}

export function resolveGrowthCard(
  copy: WorkspaceStatisticsCopy,
  card: WorkspaceStatisticsGrowthCardDto,
): { title: string; body: string; href: string } {
  if (card.key === 'highlight_profile') {
    return {
      title: copy === COPY_DE ? 'Profil hervorheben' : 'Boost profile visibility',
      body: copy === COPY_DE
        ? 'Mehr Sichtbarkeit in der Suche für dein Profil.'
        : 'Get higher visibility in search and discovery.',
      href: card.href,
    };
  }
  if (card.key === 'local_ads') {
    return {
      title: copy === COPY_DE ? 'Lokale Werbung' : 'Local promotion',
      body: copy === COPY_DE
        ? 'Dienste gezielt in aktiven Städten platzieren.'
        : 'Promote services in the most active cities.',
      href: card.href,
    };
  }
  return {
    title: copy === COPY_DE ? 'Premium Anbieter Tools' : 'Premium provider tools',
    body: copy === COPY_DE
      ? 'Erweiterte Analyse und Reichweite für Wachstum.'
      : 'Unlock advanced analytics and reach tools.',
    href: card.href,
  };
}
