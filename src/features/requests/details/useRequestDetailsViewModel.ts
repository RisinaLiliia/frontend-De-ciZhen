import * as React from 'react';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import {
  buildRequestDetailsViewModel,
  type RequestDetailsViewModel,
} from '@/features/requests/details/viewModel';

type Translate = (key: I18nKey) => string;

type UseRequestDetailsViewModelParams = {
  request: RequestResponseDto | null | undefined;
  locale: Locale;
  t: Translate;
};

function resolveClientOnline(request: RequestResponseDto | null | undefined): boolean {
  if (!request) return false;
  if (typeof request.clientIsOnline === 'boolean') return request.clientIsOnline;
  if (!request.clientLastSeenAt) return false;
  const lastSeen = new Date(request.clientLastSeenAt).getTime();
  return Number.isFinite(lastSeen) ? Date.now() - lastSeen < 5 * 60 * 1000 : false;
}

export function useRequestDetailsViewModel({
  request,
  locale,
  t,
}: UseRequestDetailsViewModelParams) {
  const localeTag = locale === 'de' ? 'de-DE' : 'en-US';
  const formatPrice = React.useMemo(
    () =>
      new Intl.NumberFormat(localeTag, {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }),
    [localeTag],
  );
  const formatDate = React.useMemo(
    () =>
      new Intl.DateTimeFormat(localeTag, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
    [localeTag],
  );
  const isClientOnline = React.useMemo(() => resolveClientOnline(request), [request]);
  const formatPriceValue = React.useCallback((value: number) => formatPrice.format(value), [formatPrice]);

  const viewModel = React.useMemo<RequestDetailsViewModel | null>(() => {
    if (!request) return null;
    return buildRequestDetailsViewModel({
      request,
      t,
      formatPrice: formatPriceValue,
      formatDate: (value) => formatDate.format(value),
      isClientOnline,
    });
  }, [formatDate, formatPriceValue, isClientOnline, request, t]);

  return {
    viewModel,
    formatPriceValue,
  };
}

