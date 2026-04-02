'use client';

import * as React from 'react';

import { ProviderCard } from '@/components/providers/ProviderCard';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { buildWorkspaceFavoriteProviderCardModels } from '@/features/workspace/private/workspaceCards.model';

type Translator = (key: I18nKey) => string;

type Args = {
  t: Translator;
  locale: Locale;
  favoriteProviders: ProviderPublicDto[];
  favoriteProviderLookup: ReadonlySet<string>;
  pendingFavoriteProviderIds: ReadonlySet<string>;
  onToggleProviderFavorite: (providerId: string) => void;
  favoriteProviderRoleLabelById: ReadonlyMap<string, string>;
  favoriteProviderCityLabelById: ReadonlyMap<string, string>;
};

export function useWorkspaceCards({
  t,
  locale,
  favoriteProviders,
  favoriteProviderLookup,
  pendingFavoriteProviderIds,
  onToggleProviderFavorite,
  favoriteProviderRoleLabelById,
  favoriteProviderCityLabelById,
}: Args) {
  const favoriteProviderCards = React.useMemo(
    () =>
      buildWorkspaceFavoriteProviderCardModels({
        t,
        locale,
        favoriteProviders,
        favoriteProviderLookup,
        pendingFavoriteProviderIds,
        onToggleProviderFavorite,
        favoriteProviderRoleLabelById,
        favoriteProviderCityLabelById,
      }).map((item) => (
        <ProviderCard
          key={item.key}
          variant="list"
          {...item.props}
        />
      )),
    [
      favoriteProviderCityLabelById,
      favoriteProviderLookup,
      favoriteProviderRoleLabelById,
      favoriteProviders,
      locale,
      onToggleProviderFavorite,
      pendingFavoriteProviderIds,
      t,
    ],
  );

  return {
    favoriteProviderCards,
  };
}
