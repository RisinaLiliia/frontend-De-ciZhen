'use client';

import { OrdersExplorer } from '@/components/orders/OrdersExplorer';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

type HomeOrdersExplorePanelProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  backHref?: string;
  showBack?: boolean;
  showHeading?: boolean;
  onListDensityChange?: (value: 'single' | 'double') => void;
};

export function HomeOrdersExplorePanel({
  t,
  locale,
  backHref = '/',
  showBack = true,
  showHeading = true,
  onListDensityChange,
}: HomeOrdersExplorePanelProps) {
  return (
    <section className="stack-sm">
      {showHeading ? (
        <div className="section-heading">
          <h2 className="section-title">{t(I18N_KEYS.requestsPage.title)}</h2>
          <p className="section-subtitle">{t(I18N_KEYS.requestsPage.subtitle)}</p>
        </div>
      ) : null}
      <OrdersExplorer
        t={t}
        locale={locale}
        showBack={showBack}
        backHref={backHref}
        emptyCtaHref="/?view=orders"
        onListDensityChange={onListDensityChange}
      />
    </section>
  );
}
