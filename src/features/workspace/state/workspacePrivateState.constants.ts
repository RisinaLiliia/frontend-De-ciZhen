'use client';

import type { WorkspacePrivateOverviewDto } from '@/lib/api/dto/workspace';

export const EMPTY_WORKSPACE_PRIVATE_OVERVIEW: WorkspacePrivateOverviewDto = {
  updatedAt: '',
  user: { userId: '', role: 'client' },
  preferredRole: 'customer',
  requestsByStatus: {
    draft: 0,
    published: 0,
    paused: 0,
    matched: 0,
    closed: 0,
    cancelled: 0,
    total: 0,
  },
  providerOffersByStatus: {
    sent: 0,
    accepted: 0,
    declined: 0,
    withdrawn: 0,
    total: 0,
  },
  clientOffersByStatus: {
    sent: 0,
    accepted: 0,
    declined: 0,
    withdrawn: 0,
    total: 0,
  },
  providerContractsByStatus: {
    pending: 0,
    confirmed: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
    total: 0,
  },
  clientContractsByStatus: {
    pending: 0,
    confirmed: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
    total: 0,
  },
  favorites: { requests: 0, providers: 0 },
  reviews: { asProvider: 0, asClient: 0 },
  ratingSummary: { average: 0, count: 0 },
  profiles: { providerCompleteness: 0, clientCompleteness: 0 },
  kpis: {
    myOpenRequests: 0,
    providerActiveContracts: 0,
    clientActiveContracts: 0,
    acceptanceRate: 0,
    activityProgress: 0,
    avgResponseMinutes: null,
    recentOffers7d: 0,
  },
  insights: {
    providerCompletedThisMonth: 0,
    providerCompletedLastMonth: 0,
    providerCompletedDeltaKind: 'none',
    providerCompletedDeltaPercent: null,
  },
  providerMonthlySeries: [],
  clientMonthlySeries: [],
};
