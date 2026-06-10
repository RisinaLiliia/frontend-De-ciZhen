import { describe, expect, it } from 'vitest';

import {
  buildWorkspaceCompletionReviewMutationQueryKeys,
  buildWorkspaceDecisionMutationQueryKeys,
  buildWorkspaceOfferReviewMutationQueryKeys,
  buildWorkspaceOwnerRequestMutationQueryKeys,
  buildWorkspacePrivateShellQueryKeys,
  buildWorkspaceProviderOfferMutationQueryKeys,
  buildWorkspacePublicRequestLifecycleQueryKeys,
} from './workspaceInvalidation.model';

describe('workspaceInvalidation.model', () => {
  it('builds shared public request lifecycle query keys', () => {
    expect(buildWorkspacePublicRequestLifecycleQueryKeys()).toEqual([
      ['requests-explorer-public'],
      ['requests-public'],
      ['workspace-public-overview'],
      ['workspace-public-summary'],
      ['requests-public-summary-total'],
      ['requests-public-city-activity'],
      ['home-nearby-requests'],
      ['requests-latest'],
      ['request-similar'],
    ]);
  });

  it('builds shared private shell query keys', () => {
    expect(buildWorkspacePrivateShellQueryKeys()).toEqual([
      ['workspace-requests'],
      ['workspace-private-overview'],
    ]);
  });

  it('builds owner request mutation query keys', () => {
    expect(buildWorkspaceOwnerRequestMutationQueryKeys()).toContainEqual(['requests-my']);
    expect(buildWorkspaceOwnerRequestMutationQueryKeys()).toContainEqual([
      'workspace-private-overview',
    ]);
    expect(buildWorkspaceOwnerRequestMutationQueryKeys()).toContainEqual([
      'workspace-public-overview',
    ]);
  });

  it('builds request-scoped decision and offer review query keys', () => {
    expect(buildWorkspaceDecisionMutationQueryKeys('req-1')).toEqual([
      ['contracts-my-client'],
      ['requests-my'],
      ['workspace-requests'],
      ['workspace-private-overview'],
      ['request-detail', 'req-1'],
      ['workspace-managed-request', 'req-1'],
    ]);

    expect(buildWorkspaceOfferReviewMutationQueryKeys('req-1')).toEqual([
      ['workspace-request-offers', 'req-1'],
      ['offers-my-client'],
      ['contracts-my-client'],
      ['requests-my'],
      ['workspace-requests'],
      ['workspace-private-overview'],
      ['request-detail', 'req-1'],
      ['workspace-managed-request', 'req-1'],
    ]);
  });

  it('builds provider-offer and completion-review query keys', () => {
    expect(buildWorkspaceProviderOfferMutationQueryKeys()).toEqual([
      ['offers-my'],
      ['requests-my'],
      ['workspace-requests'],
      ['workspace-private-overview'],
    ]);

    expect(buildWorkspaceCompletionReviewMutationQueryKeys()).toEqual([
      ['reviews-my'],
      ['bookings-my-reviewable'],
      ['contracts-my-client'],
      ['requests-my'],
      ['workspace-requests'],
      ['workspace-private-overview'],
    ]);
  });
});
