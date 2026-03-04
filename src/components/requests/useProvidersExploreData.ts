'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import { listPublicProviders } from '@/lib/api/providers';
import {
  buildProviderFavoriteLookup,
  isProviderInFavoriteLookup,
  listFavorites,
} from '@/lib/api/favorites';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { ALL_OPTION_KEY } from '@/features/workspace/requests';
import type { Locale } from '@/lib/i18n/t';

type FilterOption = {
  value: string;
  label: string;
};

type Args = {
  locale: Locale;
  isAuthed: boolean;
  isProvidersView: boolean;
  cityId: string;
  subcategoryKey: string;
  categoryKey: string;
  sortBy: string;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  services: Array<{ key: string; categoryKey: string }>;
  cityOptions: FilterOption[];
  onListDensityChange?: (value: 'single' | 'double') => void;
};

export function useProvidersExploreData({
  locale,
  isAuthed,
  isProvidersView,
  cityId,
  subcategoryKey,
  categoryKey,
  sortBy,
  page,
  limit,
  setPage,
  services,
  cityOptions,
  onListDensityChange,
}: Args) {
  const {
    data: providers = [],
    isLoading: isProvidersLoading,
    isError: isProvidersError,
  } = useQuery({
    queryKey: ['requests-explorer-providers', cityId, subcategoryKey],
    enabled: isProvidersView,
    queryFn: () =>
      listPublicProviders({
        cityId: cityId === ALL_OPTION_KEY ? undefined : cityId,
        serviceKey: subcategoryKey === ALL_OPTION_KEY ? undefined : subcategoryKey,
      }),
  });

  const { data: favoriteProviders = [] } = useQuery({
    queryKey: ['favorite-providers'],
    enabled: isProvidersView && isAuthed,
    queryFn: () => withStatusFallback(() => listFavorites('provider'), [], [401, 403]),
  });

  const providerById = React.useMemo(
    () => new Map(providers.map((provider) => [provider.id, provider])),
    [providers],
  );

  const favoriteProviderLookup = React.useMemo(
    () => buildProviderFavoriteLookup(favoriteProviders),
    [favoriteProviders],
  );

  const favoriteProviderIds = React.useMemo(
    () =>
      new Set(
        providers
          .filter((provider) => isProviderInFavoriteLookup(favoriteProviderLookup, provider))
          .map((provider) => provider.id),
      ),
    [favoriteProviderLookup, providers],
  );

  const categoryServiceKeys = React.useMemo(() => {
    if (categoryKey === ALL_OPTION_KEY) return null;
    const keys = services
      .filter((service) => service.categoryKey === categoryKey)
      .map((service) => service.key);
    return new Set(keys);
  }, [categoryKey, services]);

  const filteredProviders = React.useMemo(() => {
    const getProviderServiceKeys = (provider: (typeof providers)[number]) => {
      const direct = (provider as { serviceKey?: string | null }).serviceKey;
      const list = (provider as { serviceKeys?: string[] | null }).serviceKeys;
      const values = [
        ...(Array.isArray(list) ? list : []),
        ...(typeof direct === 'string' && direct.trim().length > 0 ? [direct] : []),
      ]
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value));
      return new Set(values);
    };

    const selectedCityLabel =
      cityId !== ALL_OPTION_KEY
        ? cityOptions.find((option) => option.value === cityId)?.label?.trim().toLowerCase()
        : '';

    return providers.filter((provider) => {
      if (cityId !== ALL_OPTION_KEY) {
        const providerCityId = (provider as { cityId?: string | null }).cityId ?? '';
        const providerCityName = (
          (provider as { cityName?: string | null }).cityName ??
          (provider as { city?: string | null }).city ??
          ''
        )
          .trim()
          .toLowerCase();
        const matchesById = providerCityId === cityId;
        const matchesByName = Boolean(selectedCityLabel) && providerCityName === selectedCityLabel;
        if (!matchesById && !matchesByName) return false;
      }

      const providerServiceKeys = getProviderServiceKeys(provider);
      if (subcategoryKey !== ALL_OPTION_KEY) {
        return providerServiceKeys.has(subcategoryKey);
      }
      if (categoryServiceKeys) {
        if (providerServiceKeys.size === 0) return false;
        for (const key of providerServiceKeys) {
          if (categoryServiceKeys.has(key)) return true;
        }
        return false;
      }
      return true;
    });
  }, [categoryServiceKeys, cityId, cityOptions, providers, subcategoryKey]);

  const totalProviders = filteredProviders.length;
  const totalProviderPages = Math.max(1, Math.ceil(totalProviders / limit));
  const totalProvidersLabel = React.useMemo(
    () => new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US').format(totalProviders),
    [locale, totalProviders],
  );

  React.useEffect(() => {
    if (!isProvidersView) return;
    if (page <= totalProviderPages) return;
    setPage(totalProviderPages);
  }, [isProvidersView, page, setPage, totalProviderPages]);

  const [providersListDensity, setProvidersListDensity] = React.useState<'single' | 'double'>('single');
  React.useEffect(() => {
    if (!isProvidersView) return;
    onListDensityChange?.(providersListDensity);
  }, [isProvidersView, onListDensityChange, providersListDensity]);

  const sortedProviders = React.useMemo(() => {
    const copy = [...filteredProviders];
    copy.sort((a, b) => {
      if (sortBy === 'date_asc') return a.ratingAvg - b.ratingAvg;
      if (sortBy === 'price_asc') return (a.basePrice ?? 0) - (b.basePrice ?? 0);
      if (sortBy === 'price_desc') return (b.basePrice ?? 0) - (a.basePrice ?? 0);
      return b.ratingAvg - a.ratingAvg;
    });
    return copy;
  }, [filteredProviders, sortBy]);

  const pagedProviders = React.useMemo(() => {
    const start = (Math.max(1, page) - 1) * limit;
    return sortedProviders.slice(start, start + limit);
  }, [limit, page, sortedProviders]);

  return {
    isProvidersLoading,
    isProvidersError,
    providerById,
    favoriteProviderLookup,
    favoriteProviderIds,
    pagedProviders,
    totalProviderPages,
    totalProvidersLabel,
    filteredProvidersCount: filteredProviders.length,
    providersListDensity,
    setProvidersListDensity,
  };
}
