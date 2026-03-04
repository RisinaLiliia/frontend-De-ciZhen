'use client';

import { RequestsExplorer } from '@/components/requests/RequestsExplorer';
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
  initialPublicRequests,
  preferInitialPublicRequests = false,
  initialPublicRequestsLoading = false,
  initialPublicRequestsError = false,
}: HomeRequestsExplorePanelProps) {
  return (
    <section className="stack-sm">
      {showHeading ? (
        <div className="section-heading">
          <h2 className="section-title">{t(I18N_KEYS.requestsPage.title)}</h2>
          <p className="section-subtitle">{t(I18N_KEYS.requestsPage.subtitle)}</p>
        </div>
      ) : null}
      <RequestsExplorer
        t={t}
        locale={locale}
        contentType={contentType}
        showBack={showBack}
        backHref={backHref}
        emptyCtaHref={contentType === 'providers' ? '/workspace?section=providers' : '/workspace?section=requests'}
        onListDensityChange={onListDensityChange}
        initialPublicRequests={initialPublicRequests}
        preferInitialPublicRequests={preferInitialPublicRequests}
        initialPublicRequestsLoading={initialPublicRequestsLoading}
        initialPublicRequestsError={initialPublicRequestsError}
      />
    </section>
  );
}
