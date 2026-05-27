import { describe, expect, it } from 'vitest';

import {
  buildWorkspaceAsideBaseProps,
  buildWorkspacePrivateIntroProps,
} from './workspacePresentation.model';

describe('workspacePresentation.model', () => {
  it('builds private intro props without legacy quick action config', () => {
    const props = buildWorkspacePrivateIntroProps({
      locale: 'de',
      activePublicSection: 'requests',
      activeWorkspaceTab: 'my-offers',
    });

    expect(props.locale).toBe('de');
    expect(props.activePublicSection).toBe('requests');
    expect(props.activeWorkspaceTab).toBe('my-offers');
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
