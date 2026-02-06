import Link from 'next/link';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { MoreDotsLink } from '@/components/ui/MoreDotsLink';
import type { I18nKey } from '@/lib/i18n/keys';

type ProviderItem = {
  id: string;
  badgeKeys: I18nKey[];
  status: 'online' | 'offline';
  statusLabelKey: I18nKey;
  avatarLetter: string;
  nameKey: I18nKey;
  roleKey: I18nKey;
  ratingKey: I18nKey;
  reviewsKey: I18nKey;
  ctaKey: I18nKey;
  profileHref: string;
  reviewsHref: string;
};

type HomeTopProvidersPanelProps = {
  t: (key: I18nKey) => string;
  providers: ReadonlyArray<ProviderItem>;
};

export function HomeTopProvidersPanel({ t, providers }: HomeTopProvidersPanelProps) {
  return (
    <section className="panel hide-mobile top-providers-panel">
      <div className="panel-header">
        <p className="section-title">{t(I18N_KEYS.homePublic.topProviders)}</p>
      </div>
      <p className="section-subtitle">{t(I18N_KEYS.homePublic.topProvidersSubtitle)}</p>
      <div className="provider-list">
        {providers.map((provider) => (
          <div key={provider.id} className="provider-card">
            <div className="provider-badges provider-badges--corner">
              {provider.badgeKeys.map((badgeKey) => (
                <span key={badgeKey} className="provider-badge">
                  {t(badgeKey)}
                </span>
              ))}
            </div>
            <div className="provider-info">
              <div className="provider-avatar-wrap">
                <span className="provider-avatar">{provider.avatarLetter}</span>
                <span
                  className={`provider-status-dot provider-status--${provider.status}`}
                  data-status-label={t(provider.statusLabelKey)}
                  aria-label={t(provider.statusLabelKey)}
                />
              </div>
              <div className="provider-main">
                <p className="provider-name">{t(provider.nameKey)}</p>
                <p className="provider-sub">{t(provider.roleKey)}</p>
                <div className="provider-rating-row">
                  <span className="rating-stars">★★★★★</span>
                  <span className="provider-rating">{t(provider.ratingKey)}</span>
                </div>
                <Link href={provider.reviewsHref} className="provider-reviews">
                  {t(provider.reviewsKey)}
                </Link>
              </div>
            </div>
            <Link href={provider.profileHref} className="btn-ghost is-primary w-full provider-cta">
              {t(provider.ctaKey)}
            </Link>
          </div>
        ))}
      </div>

      <div className="top-providers-footer flex justify-center">
        <MoreDotsLink href="/providers/top" label={t(I18N_KEYS.homePublic.topProvidersCta)} />
      </div>
    </section>
  );
}
