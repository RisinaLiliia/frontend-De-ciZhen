import * as React from 'react';
import Link from 'next/link';

import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';

type Translate = (key: I18nKey) => string;

type OverviewItem = {
  label: string;
  value: number;
  href: string;
};

type ProfileOverviewSectionProps = {
  t: Translate;
  profileCompleteness: number;
  overview: OverviewItem[];
  onGuardNavigation: (event: React.MouseEvent<HTMLElement>) => void;
};

export function ProfileOverviewSection({
  t,
  profileCompleteness,
  overview,
  onGuardNavigation,
}: ProfileOverviewSectionProps) {
  return (
    <section className="card stack-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="typo-h3">{t(I18N_KEYS.client.profileOverviewTitle)}</h2>
        <span className="badge">{t(I18N_KEYS.client.profileOverviewCompletenessPrefix)}: {profileCompleteness}%</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {overview.map((item) => (
          <Link key={item.label} href={item.href} prefetch={false} className="card stack-xs no-underline" onClick={onGuardNavigation}>
            <p className="typo-small">{item.label}</p>
            <p className="typo-h3">{item.value}</p>
            <p className="typo-small">{t(I18N_KEYS.client.profileOverviewViewAll)}</p>
          </Link>
        ))}
      </div>
      <Link href="/workspace?section=requests" prefetch={false} className="btn-primary w-fit" onClick={onGuardNavigation}>
        {t(I18N_KEYS.client.profileCompleteProfileCta)}
      </Link>
    </section>
  );
}
