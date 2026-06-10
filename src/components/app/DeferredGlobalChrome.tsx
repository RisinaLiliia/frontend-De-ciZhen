'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useDeferredMount } from '@/hooks/useDeferredMount';

const DeferredPresenceProvider = dynamic(
  () => import('@/lib/presence/PresenceProvider').then((mod) => mod.PresenceProvider),
  { ssr: false },
);
const DeferredGoogleAnalyticsManager = dynamic(
  () =>
    import('@/components/analytics/GoogleAnalyticsManager').then(
      (mod) => mod.GoogleAnalyticsManager,
    ),
  { ssr: false },
);
const DeferredCookieConsentLayer = dynamic(
  () => import('@/components/legal/CookieConsentLayer').then((mod) => mod.CookieConsentLayer),
  { ssr: false },
);
const DeferredConsentManageFooter = dynamic(
  () => import('@/components/legal/ConsentManageFooter').then((mod) => mod.ConsentManageFooter),
  { ssr: false },
);
const DeferredAppToaster = dynamic(
  () => import('@/components/ui/Toaster').then((mod) => mod.AppToaster),
  { ssr: false },
);

export function DeferredGlobalChrome() {
  const pathname = usePathname();
  const isUiReady = useDeferredMount(1200);
  const isPresenceReady = useDeferredMount(2400);
  const shouldRenderGlobalConsentFooter =
    isUiReady && pathname !== '/' && !pathname.startsWith('/workspace');

  return (
    <>
      {isPresenceReady ? <DeferredPresenceProvider /> : null}
      {isUiReady ? <DeferredGoogleAnalyticsManager /> : null}
      {shouldRenderGlobalConsentFooter ? <DeferredConsentManageFooter /> : null}
      {isUiReady ? <DeferredCookieConsentLayer /> : null}
      {isUiReady ? <DeferredAppToaster /> : null}
    </>
  );
}
