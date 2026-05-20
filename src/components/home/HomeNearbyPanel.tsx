/* src/components/home/HomeNearbyPanel.tsx */
'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import { MoreDotsLink } from '@/components/ui/MoreDotsLink';
import { useGeoRegion } from '@/hooks/useGeoRegion';
import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { PublicRequestCardActionRow } from '@/components/requests/PublicRequestCardActionRow';
import { WorkspaceGuestRequestCard } from '@/components/requests/WorkspaceGuestRequestCard';
import { useCities, useServiceCategories, useServices } from '@/features/catalog/queries';
import { useCatalogIndex } from '@/hooks/useCatalogIndex';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listPublicRequests } from '@/lib/api/requests';
import { deleteOffer, listMyProviderOffers } from '@/lib/api/offers';
import { listFavorites } from '@/lib/api/favorites';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { buildPublicRequestCardPresentation } from '@/components/requests/publicRequestCard.model';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { PublicRequestsResponseDto } from '@/lib/api/dto/requests';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { useRequestFavoriteToggle } from '@/hooks/useFavoriteToggles';
import {
  buildHomeNearbyFavoriteRequestIds,
  buildHomeNearbyNextPath,
  buildHomeNearbyOffersByRequest,
  buildHomeNearbyPanelStyle,
  buildHomeNearbyRequestById,
  buildHomeNearbyRequestsResult,
  findHomeNearbyOfferRequestId,
  resolveHomeNearbyCityId,
  resolveHomeNearbyLoginHref,
  resolveHomeNearbyOfferHref,
  resolveHomeNearbySubtitleKey,
  shouldUseHomeNearbyFallback,
} from '@/components/home/homeNearbyPanel.model';
import { workspaceQK } from '@/features/workspace/data';

type HomeNearbyPanelProps = {
  t: (key: I18nKey) => string;
  viewAllHref?: string;
  itemsLimit?: number;
  visibleRows?: number;
  regionOverride?: string | null;
  disableGeoLookup?: boolean;
};

const DEFAULT_NEARBY_ITEMS = 3;
const FALLBACK_FETCH_LIMIT = 12;

export function HomeNearbyPanel({
  t,
  viewAllHref = '/workspace?section=requests',
  itemsLimit = DEFAULT_NEARBY_ITEMS,
  visibleRows,
  regionOverride,
  disableGeoLookup = false,
}: HomeNearbyPanelProps) {
  const { locale } = useI18n();
  const authStatus = useAuthStatus();
  const isAuthed = authStatus === 'authenticated';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const detectedRegion = useGeoRegion({ enabled: !disableGeoLookup });
  const region = regionOverride ?? detectedRegion;
  const deferredRegion = React.useDeferredValue(region?.trim() ?? '');
  const { data: cities = [] } = useCities('DE', {
    enabled: deferredRegion.length > 0,
    query: deferredRegion,
    limit: 8,
  });
  const { data: categories = [] } = useServiceCategories();
  const { data: services = [] } = useServices();

  const cityId = React.useMemo(() => {
    return resolveHomeNearbyCityId(cities, region);
  }, [cities, region]);

  const { serviceByKey, categoryByKey, cityById } = useCatalogIndex({
    services,
    categories,
    cities,
  });
  const targetItems = Math.max(1, itemsLimit);
  const fallbackLimit = Math.max(FALLBACK_FETCH_LIMIT, targetItems * 2);

  const { data, isLoading, isError } = useQuery<PublicRequestsResponseDto & { usedFallback?: boolean }>({
    queryKey: workspaceQK.homeNearbyRequests(cityId, targetItems, locale),
    queryFn: async () => {
      const primary = await listPublicRequests({
        locale,
        cityId,
        sort: 'date_desc',
        limit: targetItems,
      });

      if (!shouldUseHomeNearbyFallback(cityId, primary.items.length, targetItems)) {
        return { ...primary, usedFallback: false };
      }

      const fallback = await listPublicRequests({
        locale,
        sort: 'date_desc',
        limit: fallbackLimit,
      });

      return buildHomeNearbyRequestsResult({
        primary,
        fallback,
        targetItems,
      });
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
  const { data: favoriteRequests = [] } = useQuery({
    queryKey: workspaceQK.favoriteRequests(),
    enabled: isAuthed,
    queryFn: () => withStatusFallback(() => listFavorites('request'), [], [401, 403]),
  });
  const { data: myOffers = [] } = useQuery({
    queryKey: workspaceQK.offersMy(),
    enabled: isAuthed,
    queryFn: () => withStatusFallback(() => listMyProviderOffers(), [], [401, 403]),
  });

  const requests = React.useMemo<RequestResponseDto[]>(
    () => data?.items ?? [],
    [data?.items],
  );
  const offersByRequest = React.useMemo(() => {
    return buildHomeNearbyOffersByRequest(myOffers);
  }, [myOffers]);
  const requestById = React.useMemo(
    () => buildHomeNearbyRequestById(requests),
    [requests],
  );
  const favoriteRequestIds = React.useMemo(
    () => buildHomeNearbyFavoriteRequestIds(favoriteRequests),
    [favoriteRequests],
  );
  const nextPath = React.useMemo(() => {
    return buildHomeNearbyNextPath(pathname, searchParams?.toString());
  }, [pathname, searchParams]);
  const {
    pendingFavoriteRequestIds,
    toggleRequestFavorite,
  } = useRequestFavoriteToggle({
    isAuthed,
    nextPath,
    router,
    t,
    qc,
    favoriteRequestIds,
    requestById,
  });
  const [pendingOfferRequestId, setPendingOfferRequestId] = React.useState<string | null>(null);
  const usedFallback = Boolean(data?.usedFallback && requests.length > 0);
  const subtitle = t(resolveHomeNearbySubtitleKey(usedFallback));
  const formatDate = React.useMemo(
    () =>
      new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-US', {
        day: '2-digit',
        month: 'short',
      }),
    [locale],
  );
  const formatPrice = React.useMemo(
    () =>
      new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }),
    [locale],
  );
  const openOfferSheet = React.useCallback(
    (requestId: string) => {
      if (!isAuthed) {
        toast.message(t(I18N_KEYS.requestDetails.loginRequired));
        router.push(resolveHomeNearbyLoginHref(requestId));
        return;
      }
      router.push(resolveHomeNearbyOfferHref(requestId));
    },
    [isAuthed, router, t],
  );
  const withdrawOffer = React.useCallback(
    async (offerId: string) => {
      const requestId = findHomeNearbyOfferRequestId(myOffers, offerId);
      if (!requestId) return;
      setPendingOfferRequestId(requestId);
      try {
        await deleteOffer(offerId);
        toast.success(t(I18N_KEYS.requestDetails.responseCancelled));
        await qc.invalidateQueries({ queryKey: workspaceQK.offersMy() });
      } catch {
        toast.error(t(I18N_KEYS.requestDetails.responseFailed));
      } finally {
        setPendingOfferRequestId(null);
      }
    },
    [myOffers, qc, t],
  );
  const onWithdrawOffer = React.useCallback((offerId: string) => {
    void withdrawOffer(offerId);
  }, [withdrawOffer]);

  const panelStyle = React.useMemo(
    () => buildHomeNearbyPanelStyle({ targetItems, visibleRows }),
    [targetItems, visibleRows],
  );
  const openRequest = React.useCallback((requestId: string) => {
    router.push(`/requests/${requestId}`);
  }, [router]);

  return (
    <Card className="home-nearby-panel" style={panelStyle}>
      <CardHeader className="home-panel-header">
        <div className="home-panel-heading">
          <CardTitle className="home-panel-title">{t(I18N_KEYS.homePublic.nearby)}</CardTitle>
          <p className="home-panel-subtitle">{subtitle}</p>
        </div>
      </CardHeader>
      <div className="nearby-list">
        {!isLoading && !isError && requests.length === 0 ? (
          <div className="card text-center typo-muted">{t(I18N_KEYS.homePublic.nearbyEmptyHint)}</div>
        ) : (
          requests.map((item, index) => {
            const view = buildPublicRequestCardPresentation({
              item,
              t,
              locale,
              serviceByKey,
              categoryByKey,
              cityById,
              formatPrice,
              formatDate,
              enableOfferActions: true,
              offersByRequest,
              favoriteRequestIds,
              pendingOfferRequestId,
              pendingFavoriteRequestIds,
            });

            return (
              <div key={item.id} className="workspace-guest-request-card-shell">
                <WorkspaceGuestRequestCard
                  prefetch={index < 2}
                  href={view.card.detailsHref}
                  className="workspace-guest-request-card workspace-guest-request-card--home"
                  ariaLabel={t(I18N_KEYS.requestsPage.openRequest)}
                  imageSrc={view.card.imageSrc}
                  imageAlt=""
                  imagePriority={index === 0}
                  categoryLabel={view.card.categoryLabel}
                  title={view.card.title}
                  excerpt={view.card.excerpt}
                  cityLabel={view.card.cityLabel}
                  dateLabel={view.card.dateLabel}
                  priceLabel={view.card.priceLabel}
                  priceTrend={view.card.priceTrend}
                  priceTrendLabel={view.card.priceTrendLabel}
                  badgeLabel={view.card.recurringLabel}
                  onOpen={() => openRequest(item.id)}
                  contentSlot={view.card.isInactive && view.card.inactiveMessage ? (
                    <div className="request-card__inactive-message">
                      {view.card.inactiveMessage}
                    </div>
                  ) : null}
                  overlaySlot={(
                    <FavoriteButton
                      variant="icon"
                      isFavorite={view.favorite.isFavorite}
                      isPending={view.favorite.isFavoritePending}
                      onToggle={() => {
                        void toggleRequestFavorite(item.id);
                      }}
                      ariaLabel={t(I18N_KEYS.requestDetails.ctaSave)}
                      title={t(I18N_KEYS.requestDetails.ctaSave)}
                    />
                  )}
                  actionSlot={(
                    <PublicRequestCardActionRow
                      status={view.status}
                      actions={{
                        t,
                        onSendOffer: openOfferSheet,
                        onEditOffer: openOfferSheet,
                        onWithdrawOffer: onWithdrawOffer,
                      }}
                    />
                  )}
                />
              </div>
            );
          })
        )}
      </div>

      <div className="mt-3 flex justify-center">
        <MoreDotsLink href={viewAllHref} label={t(I18N_KEYS.homePublic.nearbyCta)} />
      </div>
    </Card>
  );
}
