'use client';

import { useSearchParams } from 'next/navigation';
import { PageShell } from '@/components/layout/PageShell';
import { HOME_CATEGORIES } from '@/data/home';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';

export function ProvidersCatalogClient() {
  const t = useT();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const query = searchParams.get('q')?.trim() ?? '';
  const categoryKey = HOME_CATEGORIES.find((item) => item.key === categoryParam)?.labelKey;
  const category = categoryKey ? t(categoryKey) : categoryParam;
  const title = category
    ? `${t(I18N_KEYS.pages.providersCatalogTitle)} · ${category}`
    : t(I18N_KEYS.pages.providersCatalogTitle);

  return (
    <PageShell title={title} withSpacer={true}>
      <section className="card stack-md text-center">
        <h2 className="typo-h2">{t(I18N_KEYS.pages.providersCatalogHeadline)}</h2>
        <p className="typo-muted">
          {category
            ? `${t(I18N_KEYS.pages.providersCatalogCategoryPrefix)} ${category}.`
            : t(I18N_KEYS.pages.providersCatalogBody)}
        </p>
        {query ? (
          <p className="typo-small">
            {t(I18N_KEYS.pages.providersCatalogQueryPrefix)} {query}
          </p>
        ) : null}
        <p className="typo-small">{t(I18N_KEYS.pages.providersCatalogFooter)}</p>
      </section>
    </PageShell>
  );
}
