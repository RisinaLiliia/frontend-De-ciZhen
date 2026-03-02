import { isAnalyticsConsentGranted } from '@/lib/consent/runtime';

export function trackUXEvent(event: string, payload?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  if (!isAnalyticsConsentGranted()) return;

  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === 'function') {
    gtag('event', event, payload ?? {});
    return;
  }

  const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer;
  if (Array.isArray(dataLayer)) {
    dataLayer.push({ event, ...payload });
  }
}
