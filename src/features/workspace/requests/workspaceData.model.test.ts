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
    const offersPlan = resolveWorkspaceDataPlan({
      isAuthed: true,
      isWorkspaceAuthed: true,
      isWorkspacePublicSection: false,
      shouldLoadPrivateData: true,
      activeWorkspaceTab: 'my-offers',
      hasAccessToken: true,
    });

    expect(offersPlan.shouldLoadPrivateOverview).toBe(true);
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
    expect(reviewsPlan.shouldLoadMyOffers).toBe(false);
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
