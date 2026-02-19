// src/features/requests/details/viewModel.ts
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import { buildRequestImageList } from '@/lib/requests/images';

export type RequestDetailsViewModel = {
  title: string;
  description: string;
  tagList: string[];
  priceLabel: string;
  preferredDateLabel: string;
  images: string[];
  clientProfileHref: string | null;
  clientName: string;
  clientAvatarUrl?: string;
  hasClientInfo: boolean;
  clientStatus: 'online' | 'offline';
  clientStatusLabel: string;
  clientRatingText: string;
  clientRatingCount: number;
  cityLabel: string;
};

type BuildRequestDetailsViewModelArgs = {
  request: RequestResponseDto;
  t: (key: I18nKey) => string;
  formatPrice: (value: number) => string;
  formatDate: (value: Date) => string;
  isClientOnline: boolean;
};

export function buildRequestDetailsViewModel({
  request,
  t,
  formatPrice,
  formatDate,
  isClientOnline,
}: BuildRequestDetailsViewModelArgs): RequestDetailsViewModel {
  const title = request.title?.trim() || request.subcategoryName || request.serviceKey;
  const description =
    request.description?.trim() || t(I18N_KEYS.requestDetails.descriptionFallback);
  const categoryLabel = request.categoryName ?? request.categoryKey ?? '';
  const serviceLabel = request.subcategoryName ?? request.serviceKey;
  const tags = (request.tags ?? []).filter(Boolean);
  const tagList = tags.length ? tags : [categoryLabel, serviceLabel].filter(Boolean);
  const priceLabel =
    request.price != null
      ? formatPrice(request.price)
      : t(I18N_KEYS.requestDetails.priceOnRequest);
  const preferredDate =
    request.preferredDate && !Number.isNaN(new Date(request.preferredDate).getTime())
      ? new Date(request.preferredDate)
      : null;
  const images = buildRequestImageList(request);
  // No public client profile route exists yet; avoid generating broken links.
  const clientProfileHref = null;
  const clientName = request.clientName ?? t(I18N_KEYS.requestDetails.clientUnknown);
  const clientAvatarUrl =
    request.clientAvatarUrl && request.clientAvatarUrl.startsWith('http')
      ? request.clientAvatarUrl
      : undefined;
  const hasClientInfo = Boolean(request.clientId || request.clientName);
  const clientStatusLabel = isClientOnline
    ? t(I18N_KEYS.requestDetails.clientOnline)
    : t(I18N_KEYS.requestDetails.clientActive);
  const clientStatus = isClientOnline ? 'online' : 'offline';
  const clientRatingAvgRaw =
    typeof request.clientRatingAvg === 'number'
      ? request.clientRatingAvg
      : request.clientRatingAvg != null
        ? Number(request.clientRatingAvg)
        : null;
  const clientRatingAvg =
    typeof clientRatingAvgRaw === 'number' && Number.isFinite(clientRatingAvgRaw)
      ? clientRatingAvgRaw
      : null;
  const clientRatingCountRaw =
    typeof request.clientRatingCount === 'number'
      ? request.clientRatingCount
      : request.clientRatingCount != null
        ? Number(request.clientRatingCount)
        : null;
  const clientRatingCount =
    typeof clientRatingCountRaw === 'number' && Number.isFinite(clientRatingCountRaw)
      ? clientRatingCountRaw
      : null;
  const finalRatingAvg = clientRatingAvg ?? 0;
  const finalRatingCount = clientRatingCount ?? 0;

  return {
    title,
    description,
    tagList,
    priceLabel,
    preferredDateLabel: preferredDate ? formatDate(preferredDate) : '—',
    images,
    clientProfileHref,
    clientName,
    clientAvatarUrl,
    hasClientInfo,
    clientStatus,
    clientStatusLabel,
    clientRatingText: finalRatingAvg.toFixed(1),
    clientRatingCount: finalRatingCount,
    cityLabel: request.cityName ?? request.cityId,
  };
}
