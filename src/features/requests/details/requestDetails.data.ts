import type { QueryClient } from '@tanstack/react-query';

import type { Locale } from '@/lib/i18n/t';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import { ApiError } from '@/lib/api/http-error';
import { getMyRequestById, getPublicRequestById } from '@/lib/api/requests';

function isRequestResponseDto(value: unknown): value is RequestResponseDto {
  return Boolean(
    value
    && typeof value === 'object'
    && 'id' in value
    && 'status' in value
    && 'preferredDate' in value,
  );
}

export function getCachedOwnerRequest(
  qc: QueryClient,
  requestId: string,
  locale?: Locale,
) {
  const directKeys: Array<readonly unknown[]> = [
    locale ? ['request-detail', requestId, locale] : [],
    ['request-detail', requestId],
  ].filter((key) => key.length > 0);

  for (const key of directKeys) {
    const cached = qc.getQueryData<unknown>(key);
    if (isRequestResponseDto(cached) && cached.id === requestId) {
      return cached;
    }
  }

  const requestLists = qc.getQueriesData<RequestResponseDto[]>({
    queryKey: ['requests-my'],
  });

  for (const [, list] of requestLists) {
    if (!Array.isArray(list)) continue;
    const match = list.find((item) => item.id === requestId);
    if (match) return match;
  }

  return null;
}

export async function fetchManagedRequestDetails(params: {
  requestId: string;
  locale: Locale;
  qc: QueryClient;
  attemptOwner: boolean;
  preferOwner?: boolean;
}) {
  const {
    requestId,
    locale,
    qc,
    attemptOwner,
    preferOwner = false,
  } = params;

  if (attemptOwner) {
    try {
      return {
        request: await getMyRequestById(requestId),
        source: 'owner' as const,
      };
    } catch (error) {
      if (!(error instanceof ApiError) || (error.status !== 403 && error.status !== 404)) {
        throw error;
      }

      const cachedOwnerRequest = getCachedOwnerRequest(qc, requestId, locale);
      if (cachedOwnerRequest) {
        return {
          request: cachedOwnerRequest,
          source: 'owner' as const,
        };
      }

      if (preferOwner) {
        throw error;
      }
    }
  }

  return {
    request: await getPublicRequestById(requestId, { locale }),
    source: 'public' as const,
  };
}
