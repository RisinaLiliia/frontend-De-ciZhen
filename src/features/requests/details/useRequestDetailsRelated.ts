import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { listPublicRequests } from '@/lib/api/requests';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { Locale } from '@/lib/i18n/t';
import type { I18nKey } from '@/lib/i18n/keys';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { workspaceQK } from '@/features/workspace/requests/queryKeys';

const SIMILAR_LIMIT = 2;
const SIMILAR_FETCH_LIMIT = 8;
const LATEST_FETCH_LIMIT = 6;

type Translate = (key: I18nKey) => string;

type UseRequestDetailsRelatedParams = {
  request: RequestResponseDto | null | undefined;
  locale: Locale;
  isHydrated: boolean;
  enabled?: boolean;
  t: Translate;
};

export function useRequestDetailsRelated({
  request,
  locale,
  isHydrated,
  enabled = true,
  t,
}: UseRequestDetailsRelatedParams) {
  const hasSimilarSeed = Boolean(request?.categoryKey || request?.serviceKey);
  const similarQuery = useQuery({
    queryKey: workspaceQK.requestSimilar({
      requestId: request?.id,
      categoryKey: request?.categoryKey,
      serviceKey: request?.serviceKey,
      locale,
    }),
    enabled: enabled && isHydrated && Boolean(request?.id) && hasSimilarSeed,
    queryFn: () =>
      listPublicRequests({
        locale,
        categoryKey: request?.categoryKey ?? undefined,
        subcategoryKey: request?.serviceKey ?? undefined,
        sort: 'date_desc',
        limit: SIMILAR_FETCH_LIMIT,
      }),
    staleTime: 120_000,
    retry: 0,
    refetchOnWindowFocus: false,
  });

  const similar = React.useMemo(() => {
    if (!request) return [];
    const items = similarQuery.data?.items ?? [];
    const filtered = items
      .filter(
        (item) =>
          item.id !== request.id &&
          (item.categoryKey === request.categoryKey || item.serviceKey === request.serviceKey),
      )
      .slice(0, SIMILAR_LIMIT);
    if (filtered.length > 0) return filtered;
    return items.filter((item) => item.id !== request.id).slice(0, SIMILAR_LIMIT);
  }, [request, similarQuery.data?.items]);

  const shouldLoadLatest =
    enabled
    && Boolean(request?.id)
    && (!hasSimilarSeed || (similarQuery.isFetched && similar.length === 0));
  const { data: latestData } = useQuery({
    queryKey: workspaceQK.requestsLatest(locale),
    enabled: isHydrated && shouldLoadLatest,
    queryFn: () =>
      listPublicRequests({
        locale,
        cityId: request?.cityId ?? undefined,
        sort: 'date_desc',
        limit: LATEST_FETCH_LIMIT,
      }),
    staleTime: 120_000,
    retry: 0,
    refetchOnWindowFocus: false,
  });

  const latest = React.useMemo(() => {
    if (!request) return [];
    const items = latestData?.items ?? [];
    return items.filter((item) => item.id !== request.id).slice(0, SIMILAR_LIMIT);
  }, [latestData, request]);

  const similarFallbackMessage =
    similar.length === 0 && latest.length
      ? t(I18N_KEYS.requestDetails.noSimilarMessage)
      : undefined;
  const similarTitle =
    similar.length === 0 && latest.length
      ? t(I18N_KEYS.requestDetails.latestTitle)
      : t(I18N_KEYS.requestDetails.similar);

  const similarHref = React.useMemo(() => {
    const nextParams = new URLSearchParams();
    nextParams.set('section', 'requests');
    if (request?.categoryKey) nextParams.set('categoryKey', request.categoryKey);
    if (request?.serviceKey) nextParams.set('subcategoryKey', request.serviceKey);
    nextParams.set('sort', 'date_desc');
    nextParams.set('page', '1');
    nextParams.set('limit', '10');
    const qs = nextParams.toString();
    return `/workspace${qs ? `?${qs}` : ''}`;
  }, [request]);

  return {
    similarTitle,
    similarFallbackMessage,
    similarForRender: similar.length > 0 ? similar : latest,
    similarHref,
  };
}
