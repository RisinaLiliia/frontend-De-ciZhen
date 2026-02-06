import Link from 'next/link';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import { useRandomActiveIndex } from '@/hooks/useRandomActiveIndex';
import { MoreDotsLink } from '@/components/ui/MoreDotsLink';

type NearbyItem = {
  id: string;
  dateKey: I18nKey;
  badgeKeys: I18nKey[];
  categoryKey: I18nKey;
  descKey: I18nKey;
  cityKey: I18nKey;
  distanceKey: I18nKey;
  cadenceKey: I18nKey;
  priceKey: I18nKey;
  actionKey: I18nKey;
  href: string;
};

type HomeNearbyPanelProps = {
  t: (key: I18nKey) => string;
  items: ReadonlyArray<NearbyItem>;
};

export function HomeNearbyPanel({ t, items }: HomeNearbyPanelProps) {
  const activeIndex = useRandomActiveIndex(items.length, { intervalMs: 5200 });
  return (
    <section className="panel hide-mobile">
      <div className="panel-header">
        <p className="section-title">{t(I18N_KEYS.homePublic.nearby)}</p>
      </div>
      <p className="section-subtitle">{t(I18N_KEYS.homePublic.nearbySubtitle)}</p>
      <div className="nearby-list">
        {items.map((item, index) => (
          <Link
            key={item.id}
            href={item.href}
            aria-label={t(item.actionKey)}
            className={`order-card order-card-link ${
              index === activeIndex ? 'is-active' : ''
            }`}
          >
            <div className="order-top">
              <span className="order-date">
                <span className="order-live-dot" aria-hidden="true" />
                {t(item.dateKey)}
              </span>
              <div className="order-badges">
                {item.badgeKeys.map((badgeKey) => (
                  <span key={badgeKey} className="order-badge">
                    {t(badgeKey)}
                  </span>
                ))}
              </div>
            </div>
            <div className="order-category">{t(item.categoryKey)}</div>
            <div className="order-title">{t(item.descKey)}</div>
            <div className="order-meta">
              <span className="meta-item">{t(item.cityKey)}</span>
              <span className="meta-item">{t(item.distanceKey)}</span>
            </div>
            <div className="order-bottom">
              <span className="meta-item">{t(item.cadenceKey)}</span>
              <span className="proof-price">{t(item.priceKey)}</span>
            </div>
            <span className="order-inline-cta" aria-hidden="true">
              {t(I18N_KEYS.homePublic.nearbyInlineCta)}
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-3 flex justify-center">
        <MoreDotsLink href="/provider/requests" label={t(I18N_KEYS.homePublic.nearbyCta)} />
      </div>
    </section>
  );
}
