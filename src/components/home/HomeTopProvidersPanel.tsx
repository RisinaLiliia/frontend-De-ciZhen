/* src/components/home/HomeTopProvidersPanel.tsx */
import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { TopProvidersPanel } from '@/components/providers/TopProvidersPanel';
import { mapPublicProviderToCard } from '@/components/providers/providerCardMapper';
import { listPublicProviders } from '@/lib/api/providers';
import { listReviews } from '@/lib/api/reviews';
import { addFavorite, listFavorites, removeFavorite } from '@/lib/api/favorites';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import { useCities } from '@/features/catalog/queries';
import { pickI18n } from '@/lib/i18n/helpers';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

type HomeTopProvidersPanelProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  limit?: number;
};

export function HomeTopProvidersPanel({ t, locale, limit = 5 }: HomeTopProvidersPanelProps) {
  const authStatus = useAuthStatus();
  const isAuthed = authStatus === 'authenticated';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const [pendingFavoriteProviderIds, setPendingFavoriteProviderIds] = React.useState<Set<string>>(new Set());
  const { data: providers = [] } = useQuery({
    queryKey: ['home-top-providers', limit],
    queryFn: () => listPublicProviders(),
  });
  const { data: favoriteProviders = [] } = useQuery({
    queryKey: ['favorite-providers'],
    enabled: isAuthed,
    queryFn: () => withStatusFallback(() => listFavorites('provider'), [], [401, 403]),
  });
  const { data: cities = [] } = useCities('DE');
  const favoriteProviderIds = React.useMemo(
    () => new Set(favoriteProviders.map((item) => item.id)),
    [favoriteProviders],
  );
  const nextPath = React.useMemo(() => {
    const qs = searchParams?.toString();
    return `${pathname}${qs ? `?${qs}` : ''}`;
  }, [pathname, searchParams]);

  const sortedProviders = React.useMemo(() => {
    const copy = [...providers];
    copy.sort((a, b) => b.ratingAvg - a.ratingAvg);
    return copy.slice(0, limit);
  }, [limit, providers]);

  const cityLabelById = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const city of cities) {
      map.set(city.id, pickI18n(city.i18n, locale));
    }
    return map;
  }, [cities, locale]);

  const providerIds = React.useMemo(() => sortedProviders.map((provider) => provider.id), [sortedProviders]);
  const { data: reviewPreviewById = new Map<string, string>() } = useQuery({
    queryKey: ['home-top-providers-review-preview', ...providerIds],
    enabled: providerIds.length > 0,
    queryFn: async () => {
      const pairs = await Promise.all(
        providerIds.map(async (providerId) => {
          try {
            const reviews = await listReviews({ targetUserId: providerId, targetRole: 'provider', limit: 1, offset: 0 });
            const first = reviews[0];
            const text = first?.text?.trim() || first?.comment?.trim() || '';
            return [providerId, text] as const;
          } catch {
            return [providerId, ''] as const;
          }
        }),
      );
      const map = new Map<string, string>();
      for (const [id, text] of pairs) {
        if (text) map.set(id, text);
      }
      return map;
    },
  });

  const mappedProviders = React.useMemo(
    () =>
      sortedProviders.map((provider) => {
        const mapped = mapPublicProviderToCard({
          t,
          provider,
          cityLabel:
            (provider as { cityId?: string }).cityId
              ? cityLabelById.get((provider as { cityId?: string }).cityId ?? '') ?? ''
              : '',
          profileHref: `/providers/${provider.id}`,
          reviewsHref: `/providers/${provider.id}#reviews`,
          ctaLabel: t(I18N_KEYS.homePublic.topProvider1Cta),
          status: 'online',
        });

        const topBadge = {
          type: 'top' as const,
          size: 'md' as const,
          label: t(I18N_KEYS.homePublic.providerBadgeTopAnbieter),
          tooltip: t(I18N_KEYS.homePublic.providerBadgeTopAnbieterTooltip),
        };

        const secondary = mapped.badges.find((badge) => badge.type !== 'top') ?? null;

        return {
          ...mapped,
          badges: secondary ? [topBadge, secondary] : [topBadge],
          reviewPreview:
            reviewPreviewById.get(provider.id) ?? t(I18N_KEYS.homePublic.providerReviewPreviewDefault),
        };
      }),
    [cityLabelById, reviewPreviewById, sortedProviders, t],
  );
  const onToggleFavorite = React.useCallback(
    async (providerId: string) => {
      if (!isAuthed) {
        router.push(`/auth/login?next=${encodeURIComponent(nextPath)}`);
        toast.message(t(I18N_KEYS.requestDetails.favoritesSoon));
        return;
      }
      if (pendingFavoriteProviderIds.has(providerId)) return;
      const isSaved = favoriteProviderIds.has(providerId);
      setPendingFavoriteProviderIds((prev) => {
        const next = new Set(prev);
        next.add(providerId);
        return next;
      });
      try {
        if (isSaved) {
          await removeFavorite('provider', providerId);
          toast.message(t(I18N_KEYS.requestDetails.favoritesRemoved));
        } else {
          await addFavorite('provider', providerId);
          toast.success(t(I18N_KEYS.requestDetails.saved));
        }
        await qc.invalidateQueries({ queryKey: ['favorite-providers'] });
      } catch {
        toast.error(t(I18N_KEYS.requestDetails.favoritesFailed));
      } finally {
        setPendingFavoriteProviderIds((prev) => {
          const next = new Set(prev);
          next.delete(providerId);
          return next;
        });
      }
    },
    [favoriteProviderIds, isAuthed, nextPath, pendingFavoriteProviderIds, qc, router, t],
  );

  return (
    <TopProvidersPanel
      title={t(I18N_KEYS.homePublic.topProviders)}
      subtitle={t(I18N_KEYS.homePublic.topProvidersSubtitle)}
      ctaLabel={t(I18N_KEYS.homePublic.topProvidersCta)}
      ctaHref="/workspace?section=providers"
      providers={mappedProviders}
      favoriteProviderIds={favoriteProviderIds}
      onToggleFavorite={(providerId) => {
        void onToggleFavorite(providerId);
      }}
    />
  );
}
