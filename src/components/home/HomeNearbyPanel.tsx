import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import { useRandomActiveIndex } from '@/hooks/useRandomActiveIndex';
import { MoreDotsLink } from '@/components/ui/MoreDotsLink';
import { OrderCard } from '@/components/orders/OrderCard';

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
        <div className="section-heading">
          <p className="section-title">{t(I18N_KEYS.homePublic.nearby)}</p>
          <p className="section-subtitle">{t(I18N_KEYS.homePublic.nearbySubtitle)}</p>
        </div>
      </div>
      <div className="nearby-list">
        {items.map((item, index) => (
          <OrderCard
            key={item.id}
            href={item.href}
            ariaLabel={t(item.actionKey)}
            isActive={index === activeIndex}
            dateLabel={t(item.dateKey)}
            badges={item.badgeKeys.map((badgeKey) => t(badgeKey))}
            category={t(item.categoryKey)}
            title={t(item.descKey)}
            meta={[t(item.cityKey), t(item.distanceKey)]}
            bottomMeta={[t(item.cadenceKey)]}
            priceLabel={t(item.priceKey)}
            inlineCta={t(I18N_KEYS.homePublic.nearbyInlineCta)}
          />
        ))}
      </div>

      <div className="mt-3 flex justify-center">
        <MoreDotsLink href="/requests" label={t(I18N_KEYS.homePublic.nearbyCta)} />
      </div>
    </section>
  );
}
