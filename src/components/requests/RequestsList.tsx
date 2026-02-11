// src/components/requests/RequestsList.tsx
'use client';

import { IconCalendar, IconPin } from '@/components/ui/icons/icons';
import { OrderCard } from '@/components/orders/OrderCard';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { pickI18n } from '@/lib/i18n/helpers';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

type RequestsListProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  requests: RequestResponseDto[];
  isLoading: boolean;
  isError: boolean;
  serviceByKey: Map<string, { categoryKey: string; i18n: Record<string, string> }>;
  categoryByKey: Map<string, { i18n: Record<string, string> }>;
  cityById: Map<string, { i18n: Record<string, string> }>;
  formatDate: Intl.DateTimeFormat;
  formatPrice: Intl.NumberFormat;
};

export function RequestsList({
  t,
  locale,
  requests,
  isLoading,
  isError,
  serviceByKey,
  categoryByKey,
  cityById,
  formatDate,
  formatPrice,
}: RequestsListProps) {
  if (isLoading) {
    return (
      <>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={`request-skeleton-${index}`} className="request-card request-card--skeleton">
            <div className="request-card__media skeleton" />
            <div className="request-card__body">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-3 w-1/2" />
              <div className="skeleton h-4 w-32" />
              <div className="skeleton h-3 w-2/3" />
              <div className="request-card__tags">
                <div className="skeleton h-6 w-20 rounded-full" />
                <div className="skeleton h-6 w-24 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (isError) {
    return (
      <div className="card text-center typo-muted">
        {t(I18N_KEYS.requestsPage.error)}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="card text-center typo-muted">
        {t(I18N_KEYS.requestsPage.empty)}
      </div>
    );
  }

  return (
    <>
      {requests.map((item) => {
        const serviceLabel =
          item.subcategoryName ??
          pickServiceLabel(item.serviceKey, serviceByKey, locale);
        const fallbackCategoryKey =
          item.categoryKey ?? serviceByKey.get(item.serviceKey)?.categoryKey ?? '';
        const categoryLabel =
          item.categoryName ?? pickCategoryLabel(fallbackCategoryKey, categoryByKey, locale);
        const cityLabel =
          item.cityName ??
          (cityById.has(item.cityId)
            ? pickI18n(cityById.get(item.cityId)!.i18n, locale)
            : item.cityId);
        const propertyLabel =
          item.propertyType === 'house'
            ? t(I18N_KEYS.request.propertyHouse)
            : t(I18N_KEYS.request.propertyApartment);
        const recurringLabel = item.isRecurring
          ? t(I18N_KEYS.client.recurringLabel)
          : t(I18N_KEYS.client.onceLabel);
        const priceValue = item.price ?? estimatePrice(item.area, item.propertyType);
        const priceLabel = formatPrice.format(priceValue);
        const imageSrc =
          item.imageUrl ||
          (item.photos?.length ? item.photos[0] : null) ||
          pickRequestImage(item.categoryKey ?? '');
        const title = item.title?.trim() || item.description?.trim() || serviceLabel;
        const tags = item.tags ?? [];

        return (
          <OrderCard
            key={item.id}
            href={`/requests/${item.id}`}
            ariaLabel={t(I18N_KEYS.requestsPage.openRequest)}
            imageSrc={imageSrc}
            imageAlt={categoryLabel}
            dateLabel={formatDate.format(new Date(item.preferredDate))}
            badges={[t(I18N_KEYS.requestsPage.badgeToday), recurringLabel]}
            category={categoryLabel}
            title={title}
            meta={[
              <>
                <IconPin />
                {cityLabel}
              </>,
              <>
                <IconCalendar />
                {formatDate.format(new Date(item.preferredDate))}
              </>,
            ]}
            bottomMeta={[`${propertyLabel} · ${item.area} m²`]}
            priceLabel={priceLabel}
            tags={[
              categoryLabel,
              serviceLabel,
              ...tags.slice(0, 2),
            ]}
            inlineCta={t(I18N_KEYS.requestsPage.detailsCta)}
          />
        );
      })}
    </>
  );
}

function pickServiceLabel(
  serviceKey: string,
  serviceByKey: Map<string, { i18n: Record<string, string> }>,
  locale: Locale,
) {
  const service = serviceByKey.get(serviceKey);
  if (!service) return serviceKey;
  return pickI18n(service.i18n, locale as Locale);
}

function pickCategoryLabel(
  categoryKey: string,
  categoryByKey: Map<string, { i18n: Record<string, string> }>,
  locale: Locale,
) {
  const category = categoryByKey.get(categoryKey);
  if (!category) return categoryKey;
  return pickI18n(category.i18n, locale as Locale);
}

function estimatePrice(area: number, propertyType: string) {
  const factor = propertyType === 'house' ? 1.25 : 1;
  return Math.max(35, Math.round(area * 1.15 * factor));
}

function pickRequestImage(categoryKey: string) {
  const map: Record<string, string> = {
    cleaning: '/Reinigung im modernen Wohnzimmer.jpg',
    electric: '/Elektriker bei der Arbeit an Schaltschrank.jpg',
    plumbing: '/Freundlicher Klempner bei der Arbeit.jpg',
    repair: '/Techniker repariert Smartphone in Werkstatt.jpg',
    moving: '/Lädt Kisten aus einem Transporter.jpg',
  };
  return map[categoryKey] ?? '/Handwerker%20in%20einem%20modernen%20Wohnzimmer.jpg';
}
