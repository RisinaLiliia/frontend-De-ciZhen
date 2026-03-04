'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { HomeHero } from '@/components/home/HomeHero';
import { HomeHeroAnimatedPreview } from '@/components/home/HomeHeroAnimatedPreview';
import { HomeHowItWorksPanel } from '@/components/home/HomeHowItWorksPanel';
import { HomeNearbyPanel } from '@/components/home/HomeNearbyPanel';
import { HomePlatformActivityPanel } from '@/components/home/HomePlatformActivityPanel';
import { HomePopularServicesPanel } from '@/components/home/HomePopularServicesPanel';
import { HomeProofPanel } from '@/components/home/HomeProofPanel';
import { HomeQuickSearchPanel } from '@/components/home/HomeQuickSearchPanel';
import { HomeStatsPanel } from '@/components/home/HomeStatsPanel';
import { HomeTopProvidersPanel } from '@/components/home/HomeTopProvidersPanel';
import { HomeTrustLivePanel } from '@/components/home/HomeTrustLivePanel';
import { HOME_PROOF_CASES, HOME_SERVICES } from '@/data/home';
import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import { useGeoRegion } from '@/hooks/useGeoRegion';
import { useMockCategoryCounts } from '@/hooks/useMockCategoryCounts';
import { useMockLiveStats } from '@/hooks/useMockLiveStats';
import { useRotatingIndex } from '@/hooks/useRotatingIndex';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useT } from '@/lib/i18n/useT';
import type { ProofCase } from '@/types/home';
import { Skeleton } from '@/components/ui/Skeleton';

export function HomePageContentContainer() {
  const t = useT();
  const { locale } = useI18n();
  const router = useRouter();
  const status = useAuthStatus();
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
  const proofIndex = useRotatingIndex(proofCasesPreview.length, {
    intervalMs: 5200,
    holdMs: 600,
  });

  if (status === 'loading' || status === 'idle') {
    return (
      <>
        <section className="stack-sm">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-80" />
        </section>
        <div className="home-grid">
          <div className="stack-md">
            <section className="home-skeleton-card stack-sm">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-20 w-full" />
            </section>
            <section className="home-skeleton-card stack-sm">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </section>
            <section className="home-skeleton-card stack-sm">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-24 w-full" />
            </section>
          </div>
          <aside className="stack-md hide-mobile">
            <section className="home-skeleton-card stack-sm">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-28 w-full" />
            </section>
            <section className="home-skeleton-card stack-sm">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-28 w-full" />
            </section>
          </aside>
        </div>
      </>
    );
  }

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
            <HomePlatformActivityPanel t={t} locale={locale} />
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
            <HomeNearbyPanel
              t={t}
              viewAllHref="/workspace?section=requests"
              regionOverride={region}
              disableGeoLookup
            />
          </>
        </div>
        <div className="home-combined__right">
          <HomeTopProvidersPanel
            t={t}
            locale={locale}
            limit={4}
          />
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
