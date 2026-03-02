import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { trackUXEvent } from './analytics';
import { getDefaultConsentChoice } from './consent/storage';
import { setRuntimeConsentChoice } from './consent/runtime';

beforeEach(() => {
  vi.stubGlobal('window', { dataLayer: [] as unknown[] });
});

afterEach(() => {
  setRuntimeConsentChoice(getDefaultConsentChoice());
  vi.unstubAllGlobals();
});

describe('trackUXEvent', () => {
  it('does not push events when analytics consent is denied', () => {
    setRuntimeConsentChoice({ necessary: true, analytics: false, marketing: false });
    trackUXEvent('workspace_filter_change', { filter: 'city' });

    expect((window as Window & { dataLayer: unknown[] }).dataLayer).toHaveLength(0);
  });

  it('pushes into dataLayer when consent granted and gtag is absent', () => {
    setRuntimeConsentChoice({ necessary: true, analytics: true, marketing: false });
    trackUXEvent('workspace_filter_change', { filter: 'city' });

    expect((window as Window & { dataLayer: unknown[] }).dataLayer).toEqual([
      {
        event: 'workspace_filter_change',
        filter: 'city',
      },
    ]);
  });

  it('calls gtag when available and consent granted', () => {
    const gtag = vi.fn();
    (window as Window & { gtag?: (...args: unknown[]) => void }).gtag = gtag;

    setRuntimeConsentChoice({ necessary: true, analytics: true, marketing: false });
    trackUXEvent('home_hero_cta_click', { variant: 'animated' });

    expect(gtag).toHaveBeenCalledWith('event', 'home_hero_cta_click', { variant: 'animated' });
  });
});
