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
      shouldLoadPublicRequests: true,
      shouldLoadPrivateOverview: false,
      shouldLoadWorkspaceRequests: false,
      shouldLoadMyRequests: false,
      shouldLoadMyOffers: false,
      shouldLoadMyContracts: false,
      shouldLoadFavoriteRequests: false,
      shouldLoadFavoriteProviders: false,
      shouldLoadOfferRequests: false,
      shouldLoadReviews: false,
      shouldLoadProviders: false,
    });
  });

  it('resolves load plan for authenticated private tabs', () => {
    const overviewPlan = resolveWorkspaceDataPlan({
      isAuthed: true,
      isWorkspaceAuthed: true,
      isWorkspacePublicSection: false,
      shouldLoadPrivateData: true,
      activeWorkspaceTab: 'my-requests',
      hasAccessToken: true,
    });

    expect(overviewPlan.shouldLoadPublicRequests).toBe(true);
    expect(overviewPlan.shouldLoadPrivateOverview).toBe(true);

    const actionsPlan = resolveWorkspaceDataPlan({
      isAuthed: true,
      isWorkspaceAuthed: true,
      isWorkspacePublicSection: false,
      shouldLoadPrivateData: true,
      activeWorkspaceTab: 'profile',
      hasAccessToken: true,
    });

    expect(actionsPlan.shouldLoadPublicRequests).toBe(false);
    expect(actionsPlan.shouldLoadPrivateOverview).toBe(true);

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
    expect(myScopePlan.shouldLoadMyRequests).toBe(false);
    expect(myScopePlan.shouldLoadMyOffers).toBe(false);
    expect(myScopePlan.shouldLoadMyContracts).toBe(false);
    expect(myScopePlan.shouldLoadOfferRequests).toBe(false);
    expect(myScopePlan.shouldLoadProviders).toBe(false);
    expect(myScopePlan.shouldLoadFavoriteProviders).toBe(false);

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

    const offersPlan = resolveWorkspaceDataPlan({
      isAuthed: true,
      isWorkspaceAuthed: true,
      isWorkspacePublicSection: false,
      shouldLoadPrivateData: true,
      activeWorkspaceTab: 'my-offers',
      hasAccessToken: true,
    });

    expect(offersPlan.shouldLoadPrivateOverview).toBe(true);
    expect(offersPlan.shouldLoadWorkspaceRequests).toBe(false);
    expect(offersPlan.shouldLoadMyOffers).toBe(true);
    expect(offersPlan.shouldLoadOfferRequests).toBe(true);
    expect(offersPlan.shouldLoadProviders).toBe(true);
    expect(offersPlan.shouldLoadFavoriteProviders).toBe(true);

    const reviewsPlan = resolveWorkspaceDataPlan({
      isAuthed: true,
      isWorkspaceAuthed: true,
      isWorkspacePublicSection: false,
      shouldLoadPrivateData: true,
      activeWorkspaceTab: 'reviews',
      hasAccessToken: true,
    });

    expect(reviewsPlan.shouldLoadReviews).toBe(true);
    expect(reviewsPlan.shouldLoadWorkspaceRequests).toBe(false);
    expect(reviewsPlan.shouldLoadMyOffers).toBe(false);
    expect(reviewsPlan.shouldLoadPublicRequests).toBe(false);
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
    expect(marketPlan.shouldLoadMyOffers).toBe(true);
    expect(marketPlan.shouldLoadFavoriteRequests).toBe(true);
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
