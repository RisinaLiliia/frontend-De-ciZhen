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
import { useCities, useServiceCategories, useServices } from '@/features/catalog/queries';
import { useCatalogIndex } from '@/hooks/useCatalogIndex';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listPublicRequests } from '@/lib/api/requests';
import { addFavorite, listFavorites, removeFavorite } from '@/lib/api/favorites';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { RequestsList } from '@/components/requests/RequestsList';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { PublicRequestsResponseDto } from '@/lib/api/dto/requests';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';

type HomeNearbyPanelProps = {
  t: (key: I18nKey) => string;
  viewAllHref?: string;
  itemsLimit?: number;
  visibleRows?: number;
};

const DEFAULT_NEARBY_ITEMS = 3;
const FALLBACK_FETCH_LIMIT = 12;

export function HomeNearbyPanel({
  t,
  viewAllHref = '/requests',
  itemsLimit = DEFAULT_NEARBY_ITEMS,
  visibleRows,
}: HomeNearbyPanelProps) {
  const { locale } = useI18n();
  const authStatus = useAuthStatus();
  const isAuthed = authStatus === 'authenticated';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const [pendingFavoriteRequestIds, setPendingFavoriteRequestIds] = React.useState<Set<string>>(new Set());
  const region = useGeoRegion();
  const { data: cities = [] } = useCities('DE');
  const { data: categories = [] } = useServiceCategories();
  const { data: services = [] } = useServices();

  const cityId = React.useMemo(() => {
    if (!region) return undefined;
    const target = region.trim().toLowerCase();
    const match = cities.find((city) =>
      Object.values(city.i18n ?? {}).some((name) => name.trim().toLowerCase() === target),
    );
    return match?.id;
  }, [cities, region]);

  const { serviceByKey, categoryByKey, cityById } = useCatalogIndex({
    services,
    categories,
    cities,
  });
  const targetItems = Math.max(1, itemsLimit);
  const fallbackLimit = Math.max(FALLBACK_FETCH_LIMIT, targetItems * 2);

  const { data, isLoading, isError } = useQuery<PublicRequestsResponseDto & { usedFallback?: boolean }>({
    queryKey: ['home-nearby-requests', cityId, targetItems],
    queryFn: async () => {
      const primary = await listPublicRequests({
        cityId,
        sort: 'date_desc',
        limit: targetItems,
      });

      if (!cityId || primary.items.length >= targetItems) {
        return { ...primary, usedFallback: false };
      }

      const fallback = await listPublicRequests({
        sort: 'date_desc',
        limit: fallbackLimit,
      });
      const seen = new Set(primary.items.map((item) => item.id));
      const merged = [...primary.items];

      for (const item of fallback.items) {
        if (seen.has(item.id)) continue;
        merged.push(item);
        seen.add(item.id);
        if (merged.length >= targetItems) break;
      }

      return {
        ...primary,
        items: merged.slice(0, targetItems),
        usedFallback: merged.length > primary.items.length,
      };
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
  const { data: favoriteRequests = [] } = useQuery({
    queryKey: ['favorite-requests'],
    enabled: isAuthed,
    queryFn: () => withStatusFallback(() => listFavorites('request'), [], [401, 403]),
  });



  const requests: RequestResponseDto[] = data?.items ?? [];
  const favoriteRequestIds = React.useMemo(
    () => new Set(favoriteRequests.map((item) => item.id)),
    [favoriteRequests],
  );
  const nextPath = React.useMemo(() => {
    const qs = searchParams?.toString();
    return `${pathname}${qs ? `?${qs}` : ''}`;
  }, [pathname, searchParams]);
  const usedFallback = Boolean(data?.usedFallback && requests.length > 0);
  const subtitle = usedFallback
    ? t(I18N_KEYS.homePublic.nearbyFallbackHint)
    : t(I18N_KEYS.homePublic.nearbySubtitle);
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

  const handleToggleFavorite = React.useCallback(
    async (requestId: string) => {
      if (!isAuthed) {
        router.push(`/auth/login?next=${encodeURIComponent(nextPath)}`);
        toast.message(t(I18N_KEYS.requestDetails.favoritesSoon));
        return;
      }
      if (pendingFavoriteRequestIds.has(requestId)) return;
      const isSaved = favoriteRequestIds.has(requestId);
      setPendingFavoriteRequestIds((prev) => {
        const next = new Set(prev);
        next.add(requestId);
        return next;
      });
      try {
        if (isSaved) {
          await removeFavorite('request', requestId);
          toast.message(t(I18N_KEYS.requestDetails.favoritesRemoved));
        } else {
          await addFavorite('request', requestId);
          toast.success(t(I18N_KEYS.requestDetails.saved));
        }
        await qc.invalidateQueries({ queryKey: ['favorite-requests'] });
      } catch {
        toast.error(t(I18N_KEYS.requestDetails.favoritesFailed));
      } finally {
        setPendingFavoriteRequestIds((prev) => {
          const next = new Set(prev);
          next.delete(requestId);
          return next;
        });
      }
    },
    [favoriteRequestIds, isAuthed, nextPath, pendingFavoriteRequestIds, qc, router, t],
  );

  const panelStyle = React.useMemo(
    () =>
      ({
        '--home-nearby-visible-rows': String(Math.max(1, visibleRows ?? targetItems)),
      }) as React.CSSProperties,
    [targetItems, visibleRows],
  );

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
          <RequestsList
            t={t}
            locale={locale}
            requests={requests}
            isLoading={isLoading}
            isError={isError}
            serviceByKey={serviceByKey}
            categoryByKey={categoryByKey}
            cityById={cityById}
            formatDate={formatDate}
            formatPrice={formatPrice}
            favoriteRequestIds={favoriteRequestIds}
            pendingFavoriteRequestIds={pendingFavoriteRequestIds}
            onToggleFavorite={(requestId) => {
              void handleToggleFavorite(requestId);
            }}
            showStaticFavoriteIcon
          />
        )}
      </div>

      <div className="mt-3 flex justify-center">
        <MoreDotsLink href={viewAllHref} label={t(I18N_KEYS.homePublic.nearbyCta)} />
      </div>
    </Card>
  );
}
