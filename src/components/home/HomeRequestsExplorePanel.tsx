'use client';

import { RequestsExplorer } from '@/components/requests/RequestsExplorer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { PublicRequestsResponseDto } from '@/lib/api/dto/requests';

export type HomeRequestsExplorePanelProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  contentType?: 'requests' | 'providers';
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

export function HomeRequestsExplorePanel({
  t,
  locale,
  contentType = 'requests',
  backHref = '/',
  showBack = true,
  showHeading = true,
  onListDensityChange,
  showTopFilters = true,
  initialPublicRequests,
  preferInitialPublicRequests = false,
  initialPublicRequestsLoading = false,
  initialPublicRequestsError = false,
}: HomeRequestsExplorePanelProps) {
  return (
    <section className="stack-sm">
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
        contentType={contentType}
        showBack={showBack}
        backHref={backHref}
        emptyCtaHref={contentType === 'providers' ? '/workspace?section=providers' : '/workspace?section=requests'}
        onListDensityChange={onListDensityChange}
        showTopFilters={showTopFilters}
        initialPublicRequests={initialPublicRequests}
        preferInitialPublicRequests={preferInitialPublicRequests}
        initialPublicRequestsLoading={initialPublicRequestsLoading}
        initialPublicRequestsError={initialPublicRequestsError}
      />
    </section>
  );
}
