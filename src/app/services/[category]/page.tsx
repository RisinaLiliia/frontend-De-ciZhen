// src/app/services/[category]/page.tsx
'use client';

import { PageShell } from '@/components/layout/PageShell';
import { HOME_CATEGORIES } from '@/data/home';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';

type Props = {
  params: { category: string };
};

export default function ServiceCategoryPage({ params }: Props) {
  const t = useT();
  const labelKey = HOME_CATEGORIES.find((item) => item.key === params.category)?.labelKey;
  const label = labelKey ? t(labelKey) : params.category;

  return (
    <PageShell title={label} withSpacer={true}>
      <section className="card stack-md text-center">
        <h2 className="typo-h2">{t(I18N_KEYS.pages.serviceCategoryHeadline)}</h2>
        <p className="typo-muted">
          {t(I18N_KEYS.pages.serviceCategoryBodyPrefix)}
          {label}
          {t(I18N_KEYS.pages.serviceCategoryBodySuffix)}
        </p>
        <p className="typo-small">{t(I18N_KEYS.pages.serviceCategoryFooter)}</p>
      </section>
    </PageShell>
  );
}
