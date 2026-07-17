'use client';

import { RequestsExplorer } from '@/components/requests/RequestsExplorer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { PublicRequestsResponseDto } from '@/lib/api/dto/requests';

export type RequestsExplorePanelProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  layoutVariant?: 'default' | 'workspace';
  backHref?: string;
  showBack?: boolean;
  showHeading?: boolean;
  onListDensityChange?: (value: 'single' | 'double') => void;
  showTopFilters?: boolean;
  initialPublicRequests?: PublicRequestsResponseDto;
  preferInitialPublicRequests?: boolean;
  initialPublicRequestsLoading?: boolean;
  initialPublicRequestsError?: boolean;
};

export function RequestsExplorePanel({
  t,
  locale,
  layoutVariant = 'default',
  backHref = '/',
  showBack = true,
  showHeading = true,
  onListDensityChange,
  showTopFilters = true,
  initialPublicRequests,
  preferInitialPublicRequests = false,
  initialPublicRequestsLoading = false,
  initialPublicRequestsError = false,
}: RequestsExplorePanelProps) {
  const content = (
    <>
      {showHeading ? (
        <SectionHeader
          title={t(I18N_KEYS.requestsPage.title)}
          subtitle={t(I18N_KEYS.requestsPage.subtitle)}
          titleAs="h2"
        />
      ) : null}
      <RequestsExplorer
        t={t}
        locale={locale}
        layoutVariant={layoutVariant}
        showBack={showBack}
        backHref={backHref}
        emptyCtaHref="/workspace?section=requests"
        onListDensityChange={onListDensityChange}
        showTopFilters={showTopFilters}
        initialPublicRequests={initialPublicRequests}
        preferInitialPublicRequests={preferInitialPublicRequests}
        initialPublicRequestsLoading={initialPublicRequestsLoading}
        initialPublicRequestsError={initialPublicRequestsError}
      />
    </>
  );

  if (layoutVariant === 'workspace') return content;

  return (
    <section className="stack-sm">
      {content}
    </section>
  );
}
