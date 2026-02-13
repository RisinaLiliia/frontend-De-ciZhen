// src/components/requests/details/RequestDetailSimilar.tsx
import { OrderCard } from '@/components/orders/OrderCard';
import { MoreDotsLink } from '@/components/ui/MoreDotsLink';
import type { RequestResponseDto } from '@/lib/api/dto/requests';

type RequestDetailSimilarProps = {
  title: string;
  message?: string;
  items: RequestResponseDto[];
  footerLabel: string;
  footerHref: string;
  formatDate: (value: Date) => string;
  formatPrice: (value: number) => string;
  badgeTodayLabel: string;
  recurringLabel: string;
  onceLabel: string;
  openRequestLabel: string;
  detailsCtaLabel: string;
  priceOnRequestLabel: string;
  getImage: (item: RequestResponseDto) => string;
};

export function RequestDetailSimilar({
  title,
  message,
  items,
  footerLabel,
  footerHref,
  formatDate,
  formatPrice,
  badgeTodayLabel,
  recurringLabel,
  onceLabel,
  openRequestLabel,
  detailsCtaLabel,
  priceOnRequestLabel,
  getImage,
}: RequestDetailSimilarProps) {
  return (
    <div className="request-detail__section request-detail__similar">
      <h3 className="request-detail__section-title">{title}</h3>
      {message ? <p className="request-detail__similar-note">{message}</p> : null}
      {items.length ? (
        <>
          <div className="request-detail__similar-list">
            {items.map((item) => {
              const itemTitle = item.title?.trim() || item.subcategoryName || item.serviceKey;
              const itemPrice =
                item.price != null ? formatPrice(item.price) : priceOnRequestLabel;
              const similarDate =
                item.preferredDate && !Number.isNaN(new Date(item.preferredDate).getTime())
                  ? formatDate(new Date(item.preferredDate))
                  : '—';
              return (
                <OrderCard
                  key={item.id}
                  href={`/requests/${item.id}`}
                  ariaLabel={openRequestLabel}
                  imageSrc={getImage(item)}
                  imageAlt={itemTitle}
                  dateLabel={similarDate}
                  badges={[badgeTodayLabel, item.isRecurring ? recurringLabel : onceLabel]}
                  category={item.categoryName ?? item.categoryKey ?? ''}
                  title={itemTitle}
                  meta={[item.cityName ?? item.cityId]}
                  bottomMeta={[item.subcategoryName ?? item.serviceKey]}
                  priceLabel={itemPrice}
                  inlineCta={detailsCtaLabel}
                />
              );
            })}
          </div>
          <div className="request-detail__similar-footer">
            <MoreDotsLink href={footerHref} label={footerLabel} />
          </div>
        </>
      ) : null}
    </div>
  );
}
