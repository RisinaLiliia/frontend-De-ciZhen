'use client';

import * as React from 'react';
import type { ReactNode } from 'react';
import { TopProvidersPanel, type TopProviderItem } from '@/components/providers/TopProvidersPanel';
import { UserHeaderCardSkeleton } from '@/components/ui/UserHeaderCardSkeleton';

type WorkspaceFrameProps = {
  intro?: ReactNode;
  main: ReactNode;
  aside: ReactNode;
};

export function WorkspaceFrame({ intro, main, aside }: WorkspaceFrameProps) {
  const isDesktop = useIsDesktop();

  if (intro) {
    return (
      <div className="stack-md">
        {intro}
        <div className="requests-grid requests-grid--equal-cols">
          <div className="stack-md">{main}</div>
          {isDesktop ? <aside className="stack-md hide-mobile">{aside}</aside> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="requests-grid">
      <div className="stack-md">{main}</div>
      {isDesktop ? <aside className="stack-md hide-mobile">{aside}</aside> : null}
    </div>
  );
}

type WorkspaceTopProvidersAsideProps = {
  isLoading: boolean;
  isError: boolean;
  errorLabel: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  providers: ReadonlyArray<TopProviderItem>;
  favoriteProviderIds: Set<string>;
  pendingFavoriteProviderIds?: Set<string>;
  onToggleFavorite?: (providerId: string) => void;
};

export function WorkspaceTopProvidersAside({
  isLoading,
  isError,
  errorLabel,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  providers,
  favoriteProviderIds,
  pendingFavoriteProviderIds,
  onToggleFavorite,
}: WorkspaceTopProvidersAsideProps) {
  if (isLoading) {
    return (
      <section className="panel hide-mobile top-providers-panel">
        <div className="panel-header">
          <div className="skeleton is-wide h-5 w-40" />
        </div>
        <div className="skeleton is-wide h-4 w-48" />
        <div className="provider-list">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={`provider-skeleton-${index}`} className="provider-card">
              <UserHeaderCardSkeleton />
              <div className="skeleton is-wide h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="panel hide-mobile top-providers-panel">
        <div className="panel-header">
          <div className="skeleton is-wide h-5 w-40" />
        </div>
        <div className="skeleton is-wide h-4 w-48" />
        <div className="provider-list">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={`provider-error-skeleton-${index}`} className="provider-card">
              <UserHeaderCardSkeleton />
              <div className="skeleton is-wide h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
        <p className="typo-small text-center mt-3">{errorLabel}</p>
      </section>
    );
  }

  return (
    <TopProvidersPanel
      title={title}
      subtitle={subtitle}
      ctaLabel={ctaLabel}
      ctaHref={ctaHref}
      providers={providers}
      favoriteProviderIds={favoriteProviderIds}
      pendingFavoriteProviderIds={pendingFavoriteProviderIds}
      onToggleFavorite={onToggleFavorite}
    />
  );
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(media.matches);
    update();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  return isDesktop;
}
