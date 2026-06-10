// src/components/requests/details/RequestDetailSimilar.tsx
import { WorkspaceGuestRequestCard } from '@/components/requests/WorkspaceGuestRequestCard';
import { MoreDotsLink } from '@/components/ui/MoreDotsLink';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import { buildWorkspaceRequestDetailHref } from '@/features/workspace/requests/workspaceRequestRoute.model';

type RequestDetailSimilarProps = {
  title: string;
  message?: string;
  items: RequestResponseDto[];
  footerLabel: string;
  footerHref: string;
  formatPrice: (value: number) => string;
  recurringLabel: string;
  onceLabel: string;
  openRequestLabel: string;
  priceOnRequestLabel: string;
  getImage: (item: RequestResponseDto) => string;
  onOpenRequest?: (requestId: string) => void;
};

export function RequestDetailSimilar({
  title,
  message,
  items,
  footerLabel,
  footerHref,
  formatPrice,
  recurringLabel,
  onceLabel,
  openRequestLabel,
  priceOnRequestLabel,
  getImage,
  onOpenRequest,
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
              const excerptSource = item.description?.trim() ?? '';
              const excerpt = excerptSource && excerptSource !== itemTitle ? excerptSource : null;
              const itemPrice = item.price != null ? formatPrice(item.price) : priceOnRequestLabel;
              return (
                <WorkspaceGuestRequestCard
                  key={item.id}
                  href={buildWorkspaceRequestDetailHref({ currentSearch: '', requestId: item.id })}
                  ariaLabel={openRequestLabel}
                  onOpen={onOpenRequest ? () => onOpenRequest(item.id) : undefined}
                  imageSrc={getImage(item)}
                  imageAlt=""
                  className="workspace-guest-request-card workspace-guest-request-card--detail"
                  categoryLabel={item.categoryName ?? item.categoryKey ?? ''}
                  title={itemTitle}
                  excerpt={excerpt}
                  cityLabel={item.cityName ?? item.cityId}
                  bottomMeta={[item.subcategoryName ?? item.serviceKey]}
                  priceLabel={itemPrice}
                  badgeLabel={item.isRecurring ? recurringLabel : onceLabel}
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
