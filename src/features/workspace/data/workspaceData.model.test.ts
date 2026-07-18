import { describe, expect, it } from 'vitest';

import { buildWorkspaceOfferRequestIds, resolveWorkspaceDataPlan } from './workspaceData.model';

describe('workspaceData.model', () => {
  it('resolves load plan for public workspace view', () => {
    const plan = resolveWorkspaceDataPlan({
      isAuthed: false,
      isWorkspaceAuthed: false,
      isWorkspacePublicSection: true,
      shouldLoadPrivateData: false,
      activeWorkspaceTab: 'my-requests',
      hasAccessToken: false,
    });

    expect(plan).toMatchObject({
      shouldLoadPrivateOverview: false,
      shouldLoadWorkspaceRequests: false,
      shouldLoadMyOffers: false,
      shouldLoadFavoriteRequests: false,
      shouldLoadOfferRequests: false,
    });
  });

  it('resolves load plan for authenticated private workspace modes', () => {
    const overviewPlan = resolveWorkspaceDataPlan({
      isAuthed: true,
      isWorkspaceAuthed: true,
      isWorkspacePublicSection: false,
      shouldLoadPrivateData: true,
      activeWorkspaceTab: 'my-requests',
      hasAccessToken: true,
    });

    expect(overviewPlan.shouldLoadWorkspaceRequests).toBe(true);
    expect(overviewPlan.shouldLoadPrivateOverview).toBe(true);
    expect(overviewPlan.shouldLoadMyOffers).toBe(true);
    expect(overviewPlan.shouldLoadFavoriteRequests).toBe(true);

    const myScopePlan = resolveWorkspaceDataPlan({
      isAuthed: true,
      isWorkspaceAuthed: true,
      isWorkspacePublicSection: false,
      shouldLoadPrivateData: true,
      activeWorkspaceTab: 'my-requests',
      activePublicSection: 'requests',
      requestsScope: 'my',
      hasAccessToken: true,
    });

    expect(myScopePlan.shouldLoadWorkspaceRequests).toBe(true);
    expect(myScopePlan.shouldLoadMyOffers).toBe(false);
    expect(myScopePlan.shouldLoadOfferRequests).toBe(false);
    expect(myScopePlan.shouldLoadFavoriteRequests).toBe(false);

    const customerScopePlan = resolveWorkspaceDataPlan({
      isAuthed: true,
      isWorkspaceAuthed: true,
      isWorkspacePublicSection: false,
      shouldLoadPrivateData: true,
      activeWorkspaceTab: 'my-requests',
      activePublicSection: 'requests',
      requestsScope: 'my',
      activeRequestsRole: 'customer',
      hasAccessToken: true,
    });

    expect(customerScopePlan.shouldLoadWorkspaceRequests).toBe(true);
    expect(customerScopePlan.shouldLoadMyOffers).toBe(false);

    const providersSectionPlan = resolveWorkspaceDataPlan({
      isAuthed: true,
      isWorkspaceAuthed: true,
      isWorkspacePublicSection: false,
      shouldLoadPrivateData: true,
      activeWorkspaceTab: 'my-requests',
      activePublicSection: 'providers',
      hasAccessToken: true,
    });

    expect(providersSectionPlan.shouldLoadWorkspaceRequests).toBe(false);
    expect(providersSectionPlan.shouldLoadMyOffers).toBe(false);
    expect(providersSectionPlan.shouldLoadFavoriteRequests).toBe(false);
  });

  it('loads unified market requests in the public requests section', () => {
    const marketPlan = resolveWorkspaceDataPlan({
      isAuthed: true,
      isWorkspaceAuthed: true,
      isWorkspacePublicSection: true,
      shouldLoadPrivateData: true,
      activeWorkspaceTab: 'my-requests',
      activePublicSection: 'requests',
      requestsScope: 'market',
      hasAccessToken: true,
    });

    expect(marketPlan.shouldLoadWorkspaceRequests).toBe(true);
    expect(marketPlan.shouldLoadMyOffers).toBe(false);
    expect(marketPlan.shouldLoadFavoriteRequests).toBe(false);
  });

  it('builds unique offer request ids preserving first-seen order', () => {
    const ids = buildWorkspaceOfferRequestIds([
      { requestId: 'req-2' },
      { requestId: 'req-1' },
      { requestId: 'req-2' },
      { requestId: '' },
    ] as never[]);

    expect(ids).toEqual(['req-2', 'req-1']);
  });
});
