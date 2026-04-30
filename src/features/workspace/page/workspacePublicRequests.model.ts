'use client';

import type {
  RequestResponseDto,
  RequestStatus,
} from '@/lib/api/dto/requests';
import type {
  WorkspaceMyRequestCardDto,
  WorkspaceRequestsResponseDto,
  WorkspaceRequestsStateDto,
} from '@/lib/api/dto/workspace';
import type { Locale } from '@/lib/i18n/t';

function mapWorkspaceRequestStateToPublicStatus(state: WorkspaceMyRequestCardDto['state']): RequestStatus {
  if (state === 'active') return 'matched';
  if (state === 'completed') return 'closed';
  return 'published';
}

export function mapWorkspaceRequestCardToPublicRequest(
  card: WorkspaceMyRequestCardDto,
): RequestResponseDto {
  const preview = card.requestPreview;
  const imageUrl = preview.imageUrl?.trim() || null;
  const cityLabel = preview.cityLabel?.trim() || card.city?.trim() || null;
  const title = preview.title?.trim() || card.title?.trim() || null;
  const description = preview.excerpt?.trim() || null;
  const serviceKey = card.subcategory?.trim() || card.category?.trim() || 'service';
  const categoryKey = card.category?.trim() || preview.categoryLabel?.trim() || 'category';
  const preferredDate = card.nextEventAt?.trim() || card.createdAt?.trim() || new Date().toISOString();

  return {
    id: card.requestId,
    serviceKey,
    cityId: cityLabel || `market-${card.requestId}`,
    cityName: cityLabel,
    categoryKey,
    categoryName: preview.categoryLabel?.trim() || card.category?.trim() || categoryKey,
    subcategoryName: card.subcategory?.trim() || serviceKey,
    propertyType: 'apartment',
    area: 0,
    price: card.agreedPrice ?? card.budget ?? null,
    previousPrice: null,
    priceTrend: preview.priceTrend ?? null,
    preferredDate,
    isRecurring: false,
    title,
    description,
    photos: imageUrl ? [imageUrl] : null,
    imageUrl,
    tags: preview.tags,
    clientId: null,
    clientName: null,
    clientAvatarUrl: null,
    clientCity: cityLabel,
    clientRatingAvg: null,
    clientRatingCount: null,
    clientIsOnline: null,
    clientLastSeenAt: null,
    status: mapWorkspaceRequestStateToPublicStatus(card.state),
    publishedAt: card.createdAt?.trim() || null,
    cancelledAt: null,
    purgeAt: card.visibility?.purgeAt ?? null,
    isInactive: card.visibility?.isInactive ?? false,
    inactiveReason: card.visibility?.inactiveReason ?? null,
    inactiveMessage: card.visibility?.inactiveMessage?.trim() || null,
    createdAt: card.createdAt?.trim() || preferredDate,
  };
}

export function mapWorkspaceRequestsResponseToPublicRequests(
  response: WorkspaceRequestsResponseDto | null | undefined,
): RequestResponseDto[] {
  return response?.list.items.map(mapWorkspaceRequestCardToPublicRequest) ?? [];
}

export function buildEmptyWorkspaceMarketRequestsResponse(params: {
  locale: Locale;
  state: WorkspaceRequestsStateDto;
  period: NonNullable<WorkspaceRequestsResponseDto['filters']['period']>;
  sort: string;
  page: number;
  limit: number;
}): WorkspaceRequestsResponseDto {
  const isDe = params.locale === 'de';

  return {
    section: 'requests',
    scope: 'market',
    header: {
      title: isDe ? 'Marktanfragen' : 'Market requests',
      subtitle: isDe
        ? 'Ein gemeinsamer Marktblick für Nachfrage, Vergabe und Abschlüsse.'
        : 'One shared market view for demand, assignments, and completions.',
    },
    filters: {
      state: params.state,
      period: params.period,
      sort: params.sort,
    },
    summary: {
      items: [
        {
          key: 'all',
          label: isDe ? 'Alle' : 'All',
          value: 0,
          isHighlighted: params.state === 'all',
        },
        {
          key: 'attention',
          label: isDe ? 'Aktiv' : 'Active',
          value: 0,
          isHighlighted: params.state === 'attention',
        },
        {
          key: 'execution',
          label: isDe ? 'In Ausführung' : 'In execution',
          value: 0,
          isHighlighted: params.state === 'execution',
        },
        {
          key: 'completed',
          label: isDe ? 'Abgeschlossen' : 'Completed',
          value: 0,
          isHighlighted: params.state === 'completed',
        },
      ],
    },
    list: {
      total: 0,
      page: params.page,
      limit: params.limit,
      hasMore: false,
      items: [],
    },
    decisionPanel: {
      summary: {
        totalNeedsAction: 0,
        highPriorityCount: 0,
        newOffersCount: 0,
        replyRequiredCount: 0,
        confirmCompletionCount: 0,
        overdueCount: 0,
      },
      primaryAction: {
        label: isDe ? 'Markt prüfen' : 'Review market',
        mode: 'decision',
        targetFilter: 'needs_action',
      },
      queue: [],
      overview: {
        highUrgency: 0,
        inProgress: 0,
        completedThisPeriod: 0,
      },
    },
    sidePanel: null,
  };
}
