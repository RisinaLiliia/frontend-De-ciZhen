// src/app/page.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { PersonalNavSection } from '@/components/layout/PersonalNavSection';
import { RequestsStatsPanel } from '@/components/requests/RequestsStatsPanel';
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
import { HomeOrdersExplorePanel } from '@/components/home/HomeOrdersExplorePanel';
import { CreateRequestCard } from '@/components/requests/CreateRequestCard';
import {
  HOME_PROOF_CASES,
  HOME_SERVICES,
  HOME_TOP_PROVIDERS,
} from '@/data/home';
import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import { useMockCategoryCounts } from '@/hooks/useMockCategoryCounts';
import { useGeoRegion } from '@/hooks/useGeoRegion';
import { useMockLiveStats } from '@/hooks/useMockLiveStats';
import { useRotatingIndex } from '@/hooks/useRotatingIndex';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useT } from '@/lib/i18n/useT';
import type { ProofCase } from '@/types/home';
import { Skeleton } from '@/components/ui/Skeleton';
import { IconBriefcase, IconChat, IconCheck, IconUser } from '@/components/ui/icons/icons';

export default function HomePage() {
  const t = useT();
  const { locale } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = useAuthStatus();
  const isDemo = process.env.NEXT_PUBLIC_DEMO !== 'false';
  const heroVariant = process.env.NEXT_PUBLIC_HERO_VARIANT ?? 'animated';
  const heroAnimationMode = process.env.NEXT_PUBLIC_HERO_ANIMATION_MODE === 'showcase' ? 'showcase' : 'subtle';
  const [query, setQuery] = React.useState('');
  const [cityQuery, setCityQuery] = React.useState('');
  const [resolvedCityId, setResolvedCityId] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [exploreListDensity, setExploreListDensity] = React.useState<'single' | 'double'>('single');
  const isOrdersExploreView = searchParams.get('view') === 'orders';
  const heroAnchorRef = React.useRef<HTMLElement | null>(null);
  const listingAnchorRef = React.useRef<HTMLDivElement | null>(null);

  const scrollToSection = React.useCallback((target: HTMLElement | null) => {
    if (!target) return;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }, []);

  React.useEffect(() => {
    const target = isOrdersExploreView ? listingAnchorRef.current : heroAnchorRef.current;
    if (!target) return;
    const frame = window.requestAnimationFrame(() => scrollToSection(target));
    return () => window.cancelAnimationFrame(frame);
  }, [isOrdersExploreView, scrollToSection]);

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
    () => proofCases.slice(0, isOrdersExploreView ? 5 : 4),
    [isOrdersExploreView, proofCases],
  );
  const exploreSidebarProviders = React.useMemo(
    () => (isOrdersExploreView && exploreListDensity === 'double' ? HOME_TOP_PROVIDERS.slice(0, 2) : HOME_TOP_PROVIDERS),
    [exploreListDensity, isOrdersExploreView],
  );
  const exploreSidebarProofCases = React.useMemo(
    () => (isOrdersExploreView && exploreListDensity === 'double' ? proofCasesPreview.slice(0, 2) : proofCasesPreview),
    [exploreListDensity, isOrdersExploreView, proofCasesPreview],
  );
  const exploreTrustPanelClassName = isOrdersExploreView && exploreListDensity === 'double'
    ? 'home-trust-live-panel--compact'
    : undefined;
  const proofIndex = useRotatingIndex(proofCasesPreview.length, {
    intervalMs: 5200,
    holdMs: 600,
  });
  const exploreNavItems = React.useMemo(
    () => [
      {
        key: 'orders',
        href: '/?view=orders',
        label: 'Alle Aufträge',
        icon: <IconBriefcase />,
        value: formatNumber.format(stats.active),
        hint: t(I18N_KEYS.requestsPage.countLabel),
        forceActive: true,
      },
      {
        key: 'my-orders',
        href: '/auth/login?next=%2Forders%3Ftab%3Dmy-orders',
        label: 'Alle Anbieter',
        icon: <IconBriefcase />,
        value: formatNumber.format(HOME_TOP_PROVIDERS.length),
        hint: t(I18N_KEYS.requestsPage.heroProviderPrimaryCta),
      },
      {
        key: 'chat',
        href: '/auth/login?next=%2Fchat',
        label: t(I18N_KEYS.requestsPage.navChat),
        icon: <IconChat />,
        value: formatNumber.format(Math.max(1, Math.round(stats.active * 0.08))),
        hint: t(I18N_KEYS.requestsPage.heroProviderPrimaryCta),
      },
      {
        key: 'profile',
        href: '/auth/login?next=%2Fprofile%2Fworkspace',
        label: t(I18N_KEYS.auth.profileLabel),
        icon: <IconUser />,
        value: formatNumber.format(Math.max(1, Math.round(stats.rating * 20))),
        hint: t(I18N_KEYS.requestsPage.heroProviderPrimaryCta),
      },
      {
        key: 'reviews',
        href: '/auth/login?next=%2Forders%3Ftab%3Dreviews',
        label: t(I18N_KEYS.requestsPage.navReviews),
        icon: <IconCheck />,
        rating: {
          value: stats.rating.toFixed(1),
          reviewsCount: formatNumber.format(Math.max(1, Math.round(stats.rating * 20))),
          reviewsLabel: t(I18N_KEYS.homePublic.reviews),
        },
      },
    ],
    [formatNumber, stats.active, stats.rating, t],
  );
  const exploreStatsPayload = React.useMemo(
    () => ({
      kpis: [
        {
          key: 'active',
          label: t(I18N_KEYS.homePublic.statActive),
          value: formatNumber.format(stats.active),
          tone: 'accent' as const,
        },
        {
          key: 'new',
          label: t(I18N_KEYS.homePublic.statCompleted),
          value: formatNumber.format(stats.completed),
          tone: 'neutral' as const,
        },
        {
          key: 'response',
          label: t(I18N_KEYS.homePublic.statResponse),
          value: `${formatNumber.format(stats.responseMin)} ${t(I18N_KEYS.homePublic.statMinutes)}`,
          tone: 'success' as const,
        },
        {
          key: 'rating',
          label: t(I18N_KEYS.homePublic.statRating),
          value: stats.rating.toFixed(2),
          tone: 'accent' as const,
        },
      ],
      showKpis: false,
      showHint: false,
      chartTitle: t(I18N_KEYS.homePublic.activityTitle),
      chartDelta: t(I18N_KEYS.homePublic.live),
      chartPoints: [
        { label: 'Mo', bars: 58, line: 52 },
        { label: 'Di', bars: 52, line: 47 },
        { label: 'Mi', bars: 49, line: 44 },
        { label: 'Do', bars: 54, line: 50 },
        { label: 'Fr', bars: 61, line: 56 },
        { label: 'Sa', bars: 67, line: 62 },
      ],
      secondary: {
        leftLabel: t(I18N_KEYS.homePublic.activityRequests),
        leftValue: formatNumber.format(stats.active),
        centerLabel: t(I18N_KEYS.homePublic.activityOffers),
        centerValue: formatNumber.format(Math.max(0, Math.round(stats.completed * 0.34))),
        rightLabel: t(I18N_KEYS.homePublic.statMinutes),
        rightValue: formatNumber.format(stats.responseMin),
        progressLabel: t(I18N_KEYS.requestsPage.statsLabelAcceptanceRate),
        progressValue: 74,
        responseLabel: t(I18N_KEYS.requestsPage.statsLabelResponseTime),
        responseValue: `${formatNumber.format(stats.responseMin)} ${t(I18N_KEYS.homePublic.statMinutes)}`,
      },
      hint: {
        text: t(I18N_KEYS.requestsPage.heroProviderSubtitle),
        ctaLabel: t(I18N_KEYS.requestsPage.heroProviderPrimaryCta),
        ctaHref: '/auth/register?next=%2Forders%3Ftab%3Dnew-orders',
      },
      emptyTitle: t(I18N_KEYS.requestsPage.empty),
      emptyCtaLabel: t(I18N_KEYS.requestsPage.heroProviderPrimaryCta),
      emptyCtaHref: '/auth/register?next=%2Forders%3Ftab%3Dnew-orders',
    }),
    [formatNumber, stats.active, stats.completed, stats.rating, stats.responseMin, t],
  );

  if (status === 'loading' || status === 'idle') {
    return (
      <PageShell
        right={<AuthActions />}
        showBack={false}
        mainClassName="py-6 home-screen"
        withSpacer={true}
      >
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
      </PageShell>
    );
  }

  return (
    <PageShell
      right={<AuthActions />}
      showBack={false}
      mainClassName="py-6 home-screen"
      withSpacer={true}
    >
      {isOrdersExploreView ? (
        <>
          <section ref={heroAnchorRef} className="panel-header">
            <Link href="/" className="back-button w-fit" prefetch={false}>
              <span aria-hidden="true">←</span>
              <span className="back-button__label">{t(I18N_KEYS.common.back)}</span>
            </Link>
          </section>

          <div className="stack-md">
            <section className="home-intro-shell">
              <div className="requests-grid requests-grid--balanced">
                <div className="stack-md">
                  <PersonalNavSection items={exploreNavItems} className="personal-nav--left" />
                  <section className="panel stack-sm" aria-label="Workspace preview section">
                    <CreateRequestCard href="/request/create" />
                  </section>
                </div>

                <aside className="stack-md hide-mobile">
                  <RequestsStatsPanel
                    title="Aktivität der Plattform"
                    tabsLabel={{
                      provider: t(I18N_KEYS.app.modeProvider),
                      client: t(I18N_KEYS.app.modeClient),
                    }}
                    tab="provider"
                    showTabs={false}
                    provider={exploreStatsPayload}
                    client={exploreStatsPayload}
                  />
                </aside>
              </div>
            </section>

            <div className="requests-grid requests-grid--equal-cols">
              <div ref={listingAnchorRef}>
                <HomeOrdersExplorePanel
                  t={t}
                  locale={locale}
                  showHeading={false}
                  showBack={false}
                  backHref="/"
                  onListDensityChange={setExploreListDensity}
                />
              </div>

              <aside className="stack-md hide-mobile">
                <HomeTopProvidersPanel t={t} providers={exploreSidebarProviders} />
                <HomeProofPanel
                  t={t}
                  proofCases={exploreSidebarProofCases}
                  proofIndex={exploreSidebarProofCases.length ? proofIndex % exploreSidebarProofCases.length : 0}
                />
                <HomeTrustLivePanel className={exploreTrustPanelClassName} />
              </aside>
            </div>
          </div>
        </>
      ) : (
        <div className="home-grid">
          <section ref={heroAnchorRef} className="home-intro-shell">
            {(heroVariant === 'animated' || heroVariant === 'both') ? (
              <HomeHeroAnimatedPreview mode={heroAnimationMode} />
            ) : null}
            {heroVariant === 'current' ? <HomeHero t={t} /> : null}

            <section className="home-combined-top">
              <div className="home-combined-top__left stack-md">
                <HomeStatsPanel t={t} stats={stats} formatNumber={formatNumber} ordersHref="/?view=orders" />
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
                    params.set('view', 'orders');
                    if (query) params.set('q', query);
                    if (cityQuery) params.set('cityText', cityQuery);
                    if (resolvedCityId) params.set('cityId', resolvedCityId);
                    if (selectedCategory) params.set('subcategoryKey', selectedCategory);
                    const suffix = params.toString();
                    router.push(`/${suffix ? `?${suffix}` : ''}`);
                  }}
                />
              </div>

              <div className="home-combined-top__right">
                <HomePlatformActivityPanel t={t} locale={locale} />
              </div>
            </section>
          </section>

          <section className="home-combined">
            <div ref={listingAnchorRef} className="home-combined__left stack-md">
              <>
                <HomePopularServicesPanel
                  t={t}
                  services={services}
                  categoryCounts={categoryCounts}
                  viewAllHref="/?view=orders"
                />
                <HomeNearbyPanel t={t} viewAllHref="/?view=orders" />
              </>
            </div>
            <div className="home-combined__right">
              <HomeTopProvidersPanel
                t={t}
                providers={HOME_TOP_PROVIDERS}
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
                <HomeTrustLivePanel />
              </div>
            </section>
          </div>
        </div>
      )}
    </PageShell>
  );
}
