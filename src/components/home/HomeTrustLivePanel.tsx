/* src/components/home/HomeTrustLivePanel.tsx */
'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getPlatformLiveFeed } from '@/lib/api/analytics';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import { HomeHeroShot } from './HomeHeroShot';

type HomeTrustLivePanelProps = {
  className?: string;
  t: (key: I18nKey) => string;
};

export function HomeTrustLivePanel({ className, t }: HomeTrustLivePanelProps) {
  const isCompact = className?.includes('home-trust-live-panel--compact') ?? false;
  const liveFeedLimit = isCompact ? 3 : 4;

  const query = useQuery({
    queryKey: ['home-platform-live-feed', liveFeedLimit],
    queryFn: () => getPlatformLiveFeed(liveFeedLimit),
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
    placeholderData: (previousData) => previousData,
  });

  const events = query.data?.data ?? [];
  const isInitialLoading = query.isLoading && events.length === 0;

  return (
    <section className={`home-trust-live-panel home-trust-live-panel--hero ${className ?? ''}`.trim()}>
      <div className="home-trust-live-panel__glass" aria-hidden />

      <div className="home-trust-live-panel__heading">
        <p className="home-trust-live-panel__title">{t(I18N_KEYS.homePublic.trustPanelTitle)}</p>
        <p className="home-trust-live-panel__subtitle">{t(I18N_KEYS.homePublic.trustPanelSubtitle)}</p>
      </div>

      <HomeHeroShot className="hero-shot home-trust-live-panel__hero-shot" preserveAspectRatio="xMidYMid meet" variant="trust" />

      <div className="home-trust-live-panel__feed" aria-live="polite">
        <div className="home-trust-live-panel__feed-head">
          <p className="home-trust-live-panel__feed-title">
            <span className="home-trust-live-panel__live-dot" aria-hidden />
            {t(I18N_KEYS.homePublic.liveFeedTitle)}
          </p>
        </div>
        {isInitialLoading ? (
          <p className="home-trust-live-panel__feed-state">{t(I18N_KEYS.homePublic.liveFeedLoading)}</p>
        ) : query.isError && events.length === 0 ? (
          <p className="home-trust-live-panel__feed-state">{t(I18N_KEYS.homePublic.liveFeedError)}</p>
        ) : events.length === 0 ? (
          <p className="home-trust-live-panel__feed-state">{t(I18N_KEYS.homePublic.liveFeedEmpty)}</p>
        ) : (
          <ul className="home-trust-live-panel__feed-list">
            {events.map((event) => (
              <li key={event.id} className="home-trust-live-panel__feed-item">
                <span>{event.text}</span>
                <time dateTime={`PT${Math.max(1, event.minutesAgo)}M`}>
                  {t(I18N_KEYS.homePublic.liveFeedAgoMinutes).replace('{n}', String(Math.max(1, event.minutesAgo)))}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link href="/auth/login?next=%2Frequest%2Fnew" className="home-trust-live-panel__cta home-cta">
        {t(I18N_KEYS.homePublic.trustPanelCta)}
      </Link>
      <p className="home-trust-live-panel__cta-note">{t(I18N_KEYS.homePublic.trustPanelNote)}</p>
    </section>
  );
}
