'use client';

import * as React from 'react';

import { ProviderCard } from '@/components/providers/ProviderCard';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import type { I18nKey } from '@/lib/i18n/keys';
import { buildWorkspaceFavoriteProviderCardModels } from '@/features/workspace/private/workspaceCards.model';

type Translator = (key: I18nKey) => string;

type Args = {
  t: Translator;
  favoriteProviders: ProviderPublicDto[];
  favoriteProviderLookup: ReadonlySet<string>;
  pendingFavoriteProviderIds: ReadonlySet<string>;
  onToggleProviderFavorite: (providerId: string) => void;
  favoriteProviderRoleLabelById: ReadonlyMap<string, string>;
  favoriteProviderCityLabelById: ReadonlyMap<string, string>;
};

export function useWorkspaceCards({
  t,
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
      onToggleProviderFavorite,
      pendingFavoriteProviderIds,
      t,
    ],
  );

  return {
    favoriteProviderCards,
  };
}
