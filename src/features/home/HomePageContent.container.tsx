'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { HomeHero } from '@/components/home/HomeHero';
import { HomeHeroAnimatedPreview } from '@/components/home/HomeHeroAnimatedPreview';
import { HomeHowItWorksPanel } from '@/components/home/HomeHowItWorksPanel';
import { HomePopularServicesPanel } from '@/components/home/HomePopularServicesPanel';
import { HomeProofPanel } from '@/components/home/HomeProofPanel';
import { HomeQuickSearchPanel } from '@/components/home/HomeQuickSearchPanel';
import { HomeStatsPanel } from '@/components/home/HomeStatsPanel';
import { HomeTrustLivePanel } from '@/components/home/HomeTrustLivePanel';
import { HomePanelPlaceholder } from '@/components/home/HomePanelPlaceholder';
import { HOME_PROOF_CASES, HOME_SERVICES } from '@/data/home';
import { useGeoRegion } from '@/hooks/useGeoRegion';
import { useDeferredMount } from '@/hooks/useDeferredMount';
import { useMockCategoryCounts } from '@/hooks/useMockCategoryCounts';
import { useMockLiveStats } from '@/hooks/useMockLiveStats';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useT } from '@/lib/i18n/useT';
import type { ProofCase } from '@/types/home';

const DeferredHomePlatformActivityPanelContainer = dynamic(
  () =>
    import('@/components/home/HomePlatformActivityPanelContainer').then(
      (mod) => mod.HomePlatformActivityPanelContainer,
    ),
  {
    ssr: false,
    loading: () => <HomePanelPlaceholder className="home-activity-panel" minHeight={284} bodyRows={3} />,
  },
);

const DeferredHomeNearbyPanel = dynamic(
  () => import('@/components/home/HomeNearbyPanel').then((mod) => mod.HomeNearbyPanel),
  {
    ssr: false,
    loading: () => <HomePanelPlaceholder className="home-nearby-panel" minHeight={472} bodyRows={3} />,
  },
);

const DeferredHomeTopProvidersPanel = dynamic(
  () => import('@/components/home/HomeTopProvidersPanel').then((mod) => mod.HomeTopProvidersPanel),
  {
    ssr: false,
    loading: () => (
      <HomePanelPlaceholder
        className="hide-mobile top-providers-panel"
        minHeight={472}
        bodyRows={4}
      />
    ),
  },
);

export function HomePageContentContainer() {
  const t = useT();
  const { locale } = useI18n();
  const router = useRouter();
  const isDemo = process.env.NEXT_PUBLIC_DEMO !== 'false';
  const heroVariant = process.env.NEXT_PUBLIC_HERO_VARIANT ?? 'animated';
  const heroAnimationMode = process.env.NEXT_PUBLIC_HERO_ANIMATION_MODE === 'showcase' ? 'showcase' : 'subtle';
  const [query, setQuery] = React.useState('');
  const [cityQuery, setCityQuery] = React.useState('');
  const [resolvedCityId, setResolvedCityId] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('');

  const stats = useMockLiveStats(
    {
      active: 1284,
      completed: 3912,
      responseMin: 18,
      rating: 4.8,
      reviews: 12440,
    },
    { enabled: isDemo },
  );
  const categoryCounts = useMockCategoryCounts(
    {
      cleaning: 12,
      electric: 7,
      plumbing: 9,
      repair: 5,
      moving: 6,
      assembly: 8,
    },
    { enabled: isDemo },
  );
  const region = useGeoRegion();

  const services = React.useMemo(
    () => HOME_SERVICES.map((item) => ({ ...item, label: t(item.labelKey) })),
    [t],
  );

  const formatNumber = React.useMemo(() => new Intl.NumberFormat(locale), [locale]);

  const proofCases = React.useMemo<ProofCase[]>(
    () =>
      HOME_PROOF_CASES.map((item) => ({
        id: item.id,
        title: t(item.titleKey),
        info: t(item.infoKey),
        review: t(item.reviewKey),
        price: t(item.priceKey),
        rating: item.rating,
        publishedAt: item.publishedAt,
      })),
    [t],
  );
  const proofCasesPreview = React.useMemo(
    () => proofCases.slice(0, 4),
    [proofCases],
  );
  const proofIndex = 0;
  const isActivityReady = useDeferredMount(1200);
  const isDiscoveryReady = useDeferredMount(2200);

  return (
    <div className="home-grid">
      <section className="home-intro-shell">
        {(heroVariant === 'animated' || heroVariant === 'both') ? (
          <HomeHeroAnimatedPreview mode={heroAnimationMode} t={t} />
        ) : null}
        {heroVariant === 'current' ? <HomeHero t={t} /> : null}

        <section className="home-combined-top">
          <div className="home-combined-top__left stack-md">
            <HomeStatsPanel t={t} stats={stats} formatNumber={formatNumber} requestsHref="/workspace?section=requests" />
            <HomeQuickSearchPanel
              t={t}
              locale={locale}
              region={region}
              query={query}
              cityQuery={cityQuery}
              selectedCategory={selectedCategory}
              onQueryChange={setQuery}
              onCityQueryChange={setCityQuery}
              onCityResolvedChange={setResolvedCityId}
              onCategoryChange={setSelectedCategory}
              onSearch={() => {
                const params = new URLSearchParams();
                params.set('section', 'requests');
                if (query) params.set('q', query);
                if (cityQuery) params.set('cityText', cityQuery);
                if (resolvedCityId) params.set('cityId', resolvedCityId);
                if (selectedCategory) params.set('subcategoryKey', selectedCategory);
                const suffix = params.toString();
                router.push(`/workspace${suffix ? `?${suffix}` : ''}`);
              }}
            />
          </div>

          <div className="home-combined-top__right">
            {isActivityReady ? (
              <DeferredHomePlatformActivityPanelContainer t={t} locale={locale} />
            ) : (
              <HomePanelPlaceholder className="home-activity-panel" minHeight={284} bodyRows={3} />
            )}
          </div>
        </section>
      </section>

      <section className="home-combined">
        <div className="home-combined__left stack-md">
          <>
            <HomePopularServicesPanel
              t={t}
              services={services}
              categoryCounts={categoryCounts}
              viewAllHref="/workspace?section=requests"
            />
            {isDiscoveryReady ? (
              <DeferredHomeNearbyPanel
                t={t}
                viewAllHref="/workspace?section=requests"
                regionOverride={region}
                disableGeoLookup
              />
            ) : (
              <HomePanelPlaceholder className="home-nearby-panel" minHeight={472} bodyRows={3} />
            )}
          </>
        </div>
        <div className="home-combined__right">
          {isDiscoveryReady ? (
            <DeferredHomeTopProvidersPanel t={t} locale={locale} limit={4} />
          ) : (
            <HomePanelPlaceholder className="hide-mobile top-providers-panel" minHeight={472} bodyRows={4} />
          )}
        </div>
      </section>

      <div className="home-grid__main">
        <section className="home-combined-bottom">
          <div className="home-combined-bottom__left stack-md">
            <HomeProofPanel t={t} proofCases={proofCasesPreview} proofIndex={proofIndex} />
            <HomeHowItWorksPanel t={t} />
          </div>
          <div className="home-combined-bottom__right">
            <HomeTrustLivePanel t={t} />
          </div>
        </section>
      </div>
    </div>
  );
}
