export function trackUXEvent(event: string, payload?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;

  const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer;
  if (Array.isArray(dataLayer)) {
    dataLayer.push({ event, ...payload });
  }
}

