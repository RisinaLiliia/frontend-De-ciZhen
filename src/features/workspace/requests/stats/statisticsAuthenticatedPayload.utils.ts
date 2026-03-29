import type {
  WorkspacePrivateOverviewDto,
  WorkspaceStatisticsOverviewDto,
} from '@/lib/api/dto/workspace';

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Number(value.toFixed(2))));
}

function buildFallbackStages(params: {
  requestsTotal: number;
  offersTotal: number;
  confirmedResponsesTotal: number;
  closedContractsTotal: number;
  completedJobsTotal: number;
  profitAmount: number;
  offerResponseRatePercent: number;
  confirmationRatePercent: number;
  contractClosureRatePercent: number;
  completionRatePercent: number;
}) {
  const {
    requestsTotal,
    offersTotal,
    confirmedResponsesTotal,
    closedContractsTotal,
    completedJobsTotal,
    profitAmount,
    offerResponseRatePercent,
    confirmationRatePercent,
    contractClosureRatePercent,
    completionRatePercent,
  } = params;
  const base = Math.max(1, requestsTotal);
  const widths = {
    requests: 100,
    offers: Math.max(0, Math.min(100, Number(((offersTotal / base) * 100).toFixed(2)))),
    confirmations: Math.max(0, Math.min(100, Number(((confirmedResponsesTotal / base) * 100).toFixed(2)))),
    contracts: Math.max(0, Math.min(100, Number(((closedContractsTotal / base) * 100).toFixed(2)))),
    completed: Math.max(0, Math.min(100, Number(((completedJobsTotal / base) * 100).toFixed(2)))),
  };

  return [
    {
      id: 'requests' as const,
      label: 'Anfragen',
      value: requestsTotal,
      displayValue: `${requestsTotal}`,
      widthPercent: widths.requests,
      rateLabel: 'Basis',
      ratePercent: 100,
      helperText: null,
    },
    {
      id: 'offers' as const,
      label: 'Angebote von Anbietern',
      value: offersTotal,
      displayValue: `${offersTotal}`,
      widthPercent: widths.offers,
      rateLabel: 'Antwortquote',
      ratePercent: offerResponseRatePercent,
      helperText: null,
    },
    {
      id: 'confirmations' as const,
      label: 'Bestätigte Rückmeldungen',
      value: confirmedResponsesTotal,
      displayValue: `${confirmedResponsesTotal}`,
      widthPercent: widths.confirmations,
      rateLabel: 'Zustimmungsrate',
      ratePercent: confirmationRatePercent,
      helperText: null,
    },
    {
      id: 'contracts' as const,
      label: 'Geschlossene Verträge',
      value: closedContractsTotal,
      displayValue: `${closedContractsTotal}`,
      widthPercent: widths.contracts,
      rateLabel: 'Abschlussrate',
      ratePercent: contractClosureRatePercent,
      helperText: null,
    },
    {
      id: 'completed' as const,
      label: 'Erfolgreich abgeschlossen',
      value: completedJobsTotal,
      displayValue: `${completedJobsTotal}`,
      widthPercent: widths.completed,
      rateLabel: 'Erfüllungsquote',
      ratePercent: completionRatePercent,
      helperText: null,
    },
    {
      id: 'revenue' as const,
      label: 'Gewinnsumme',
      value: profitAmount,
      displayValue: '0 €',
      widthPercent: widths.completed,
      rateLabel: 'Ø Umsatz / Auftrag',
      ratePercent: null,
      helperText: '—',
    },
  ];
}

function hasExplicitPersonalizedData(payload: WorkspaceStatisticsOverviewDto) {
  return Boolean(
    payload.mode === 'personalized' ||
    payload.userIntelligence ||
    payload.funnelComparison ||
    payload.kpis.profileCompleteness !== null ||
    payload.kpis.openRequests !== null ||
    payload.kpis.recentOffers7d !== null,
  );
}

export function hydrateAuthenticatedStatisticsPayload(params: {
  payload: WorkspaceStatisticsOverviewDto;
  privateOverview: WorkspacePrivateOverviewDto | null;
}): WorkspaceStatisticsOverviewDto {
  const { payload, privateOverview } = params;
  if (!privateOverview || hasExplicitPersonalizedData(payload)) {
    return payload;
  }

  const completedJobs =
    privateOverview.providerContractsByStatus.completed +
    privateOverview.clientContractsByStatus.completed;
  const profileCompleteness = Math.max(
    privateOverview.profiles.providerCompleteness,
    privateOverview.profiles.clientCompleteness,
  );
  const requestsTotal = Math.max(0, Math.round(privateOverview.kpis.myOpenRequests));
  const offersTotal = Math.max(0, Math.round(privateOverview.providerOffersByStatus.sent));
  const confirmedResponsesTotal = Math.max(0, Math.round(privateOverview.providerOffersByStatus.accepted));
  const closedContractsTotal = Math.max(0, Math.round(completedJobs));
  const completedJobsTotal = Math.max(0, Math.round(completedJobs));
  const profitAmount = 0;
  const offerResponseRatePercent = clampPercent((offersTotal / Math.max(1, requestsTotal)) * 100);
  const confirmationRatePercent = clampPercent((confirmedResponsesTotal / Math.max(1, offersTotal)) * 100);
  const contractClosureRatePercent = clampPercent((closedContractsTotal / Math.max(1, confirmedResponsesTotal)) * 100);
  const completionRatePercent = clampPercent((completedJobsTotal / Math.max(1, closedContractsTotal)) * 100);
  const conversionRate = clampPercent((completedJobsTotal / Math.max(1, requestsTotal)) * 100);

  return {
    ...payload,
    mode: 'personalized',
    kpis: {
      ...payload.kpis,
      requestsTotal: privateOverview.requestsByStatus.total,
      offersTotal,
      completedJobsTotal,
      successRate: privateOverview.kpis.acceptanceRate,
      avgResponseMinutes: privateOverview.kpis.avgResponseMinutes,
      profileCompleteness,
      openRequests: privateOverview.kpis.myOpenRequests,
      recentOffers7d: privateOverview.kpis.recentOffers7d,
    },
    profileFunnel: {
      ...payload.profileFunnel,
      requestsTotal,
      offersTotal,
      confirmedResponsesTotal,
      closedContractsTotal,
      completedJobsTotal,
      profitAmount,
      offerResponseRatePercent,
      confirmationRatePercent,
      contractClosureRatePercent,
      completionRatePercent,
      conversionRate,
      totalConversionPercent: conversionRate,
      summaryText: `Von ${requestsTotal} Anfragen wurden ${completedJobsTotal} erfolgreich abgeschlossen.`,
      stages: buildFallbackStages({
        requestsTotal,
        offersTotal,
        confirmedResponsesTotal,
        closedContractsTotal,
        completedJobsTotal,
        profitAmount,
        offerResponseRatePercent,
        confirmationRatePercent,
        contractClosureRatePercent,
        completionRatePercent,
      }),
    },
  };
}
