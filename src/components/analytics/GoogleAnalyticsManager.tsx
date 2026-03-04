'use client';

import * as React from 'react';
import Script from 'next/script';
import { useConsent } from '@/lib/consent/ConsentProvider';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? '';
const ANALYTICS_ENABLED =
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';

function isLocalhostHost(hostname: string) {
  return hostname === 'localhost' || hostname === '::1' || hostname === '[::1]' || hostname.startsWith('127.');
}

function ensureGtagShim() {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = (...args: unknown[]) => {
      window.dataLayer?.push(args);
    };
  }
}

function updateGoogleConsent(analyticsGranted: boolean, marketingGranted: boolean) {
  if (typeof window === 'undefined') return;
  ensureGtagShim();
  window.gtag?.('consent', 'update', {
    analytics_storage: analyticsGranted ? 'granted' : 'denied',
    ad_storage: marketingGranted ? 'granted' : 'denied',
    ad_user_data: marketingGranted ? 'granted' : 'denied',
    ad_personalization: marketingGranted ? 'granted' : 'denied',
  });
}

export function GoogleAnalyticsManager() {
  const { ready, choice } = useConsent();
  const [hostResolved, setHostResolved] = React.useState(false);
  const [isLocalhost, setIsLocalhost] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsLocalhost(isLocalhostHost(window.location.hostname));
    setHostResolved(true);
  }, []);

  const canRunAnalytics = ready && hostResolved && !isLocalhost && ANALYTICS_ENABLED && Boolean(GA_MEASUREMENT_ID);

  React.useEffect(() => {
    if (!canRunAnalytics) return;
    updateGoogleConsent(choice.analytics, choice.marketing);
  }, [canRunAnalytics, choice.analytics, choice.marketing]);

  if (!canRunAnalytics) {
    return null;
  }

  return (
    <>
      <Script
        id="dc-ga-default-consent"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            window.gtag = window.gtag || function(){dataLayer.push(arguments);};
            window.gtag('consent', 'default', {
              analytics_storage: 'denied',
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied'
            });
          `,
        }}
      />

      {choice.analytics ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
          <Script
            id="dc-ga-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                window.gtag = window.gtag || function(){dataLayer.push(arguments);};
                window.gtag('js', new Date());
                window.gtag('config', '${GA_MEASUREMENT_ID}', {
                  anonymize_ip: true,
                  allow_google_signals: false,
                  send_page_view: true
                });
              `,
            }}
          />
        </>
      ) : null}
    </>
  );
}
