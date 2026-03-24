import { describe, expect, it } from 'vitest';

import {
  buildWorkspaceAsideBaseProps,
  buildWorkspacePrivateIntroProps,
} from './workspacePresentation.model';

describe('workspacePresentation.model', () => {
  it('builds private intro props with translated stats labels and quick action config', () => {
    const props = buildWorkspacePrivateIntroProps({
      t: (key) => String(key),
      locale: 'de',
      activePublicSection: 'requests',
      activeWorkspaceTab: 'my-offers',
      personalNavItems: [{ key: 'requests', label: 'Requests', href: '/workspace', icon: null }],
      hideNavBadges: true,
      insightText: 'Insight',
      activityProgress: 75,
      statsOrder: [{ tab: 'provider', title: 'Provider stats' }],
      providerStatsPayload: {
        kpis: [],
        chartTitle: 'Provider chart',
        chartPoints: [],
        secondary: {
          leftLabel: 'Left',
          leftValue: '0',
          centerLabel: 'Center',
          centerValue: '0',
          rightLabel: 'Right',
          rightValue: '0',
          progressLabel: 'Progress',
          progressValue: 0,
          responseLabel: 'Response',
          responseValue: '0%',
        },
        hint: {
          text: 'Hint',
          ctaLabel: 'Open',
          ctaHref: '/workspace',
        },
        emptyTitle: 'Empty',
        emptyCtaLabel: 'Create',
        emptyCtaHref: '/request/create',
      },
      clientStatsPayload: {
        kpis: [],
        chartTitle: 'Client chart',
        chartPoints: [],
        secondary: {
          leftLabel: 'Left',
          leftValue: '0',
          centerLabel: 'Center',
          centerValue: '0',
          rightLabel: 'Right',
          rightValue: '0',
          progressLabel: 'Progress',
          progressValue: 0,
          responseLabel: 'Response',
          responseValue: '0%',
        },
        hint: {
          text: 'Hint',
          ctaLabel: 'Open',
          ctaHref: '/workspace',
        },
        emptyTitle: 'Empty',
        emptyCtaLabel: 'Create',
        emptyCtaHref: '/request/create',
      },
      createRequestHref: '/request/create',
      showQuickAction: false,
    });

    expect(props.hideNavBadges).toBe(true);
    expect(props.locale).toBe('de');
    expect(props.activePublicSection).toBe('requests');
    expect(props.activeWorkspaceTab).toBe('my-offers');
    expect(props.statsTabsLabel.provider).toBe('homePublic.howItWorksProviderTab');
    expect(props.statsErrorLabel).toBe('requestsPage.statsLoadError');
    expect(props.quickActionHref).toBe('/request/create');
    expect(props.showQuickAction).toBe(false);
  });

  it('builds aside base props with translated labels and provider state', () => {
    const providers = [{ id: 'provider-1' }];
    const favoriteProviderIds = new Set(['provider-1']);

    const props = buildWorkspaceAsideBaseProps({
      t: (key) => String(key),
      isProvidersLoading: false,
      isProvidersError: true,
      topProviders: providers as never,
      favoriteProviderIds,
    });

    expect(props.isLoading).toBe(false);
    expect(props.isError).toBe(true);
    expect(props.title).toBe('homePublic.topProviders');
    expect(props.subtitle).toBe('homePublic.topProvidersSubtitle');
    expect(props.providers).toBe(providers);
    expect(props.favoriteProviderIds).toBe(favoriteProviderIds);
  });
});
