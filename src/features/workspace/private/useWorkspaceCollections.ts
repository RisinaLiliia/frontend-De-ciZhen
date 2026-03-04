'use client';

import * as React from 'react';

import type { OfferDto } from '@/lib/api/dto/offers';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import type { ContractDto } from '@/lib/api/dto/contracts';
import type { I18nMap } from '@/lib/i18n/helpers';
import type { Locale } from '@/lib/i18n/t';
import {
  buildAllMyContracts,
  buildFavoriteProviderCityLabelById,
  buildFavoriteProviderIds,
  buildFavoriteProviderRoleLabelById,
  buildFavoriteRequestIds,
  buildOffersByRequest,
  buildProviderFavoriteLookup,
  buildProviderById,
  buildRequestById,
} from '@/features/workspace/private/workspaceCollections.selectors';

type Args = {
  requests: RequestResponseDto[];
  favoriteRequests: RequestResponseDto[];
  providers: ProviderPublicDto[];
  favoriteProviders: ProviderPublicDto[];
  myOffers: OfferDto[];
  myProviderContracts: ContractDto[];
  myClientContracts: ContractDto[];
  cityById: ReadonlyMap<string, { i18n: I18nMap }>;
  serviceByKey: ReadonlyMap<string, { i18n: I18nMap }>;
  locale: Locale;
};

export function useWorkspaceCollections({
  requests,
  favoriteRequests,
  providers,
  favoriteProviders,
  myOffers,
  myProviderContracts,
  myClientContracts,
  cityById,
  serviceByKey,
  locale,
}: Args) {
  const favoriteRequestIds = React.useMemo(
    () => buildFavoriteRequestIds(favoriteRequests),
    [favoriteRequests],
  );

  const requestById = React.useMemo(
    () => buildRequestById(requests, favoriteRequests),
    [favoriteRequests, requests],
  );

  const providerById = React.useMemo(
    () => buildProviderById(providers, favoriteProviders),
    [favoriteProviders, providers],
  );

  const favoriteProviderLookup = React.useMemo(
    () => buildProviderFavoriteLookup(favoriteProviders),
    [favoriteProviders],
  );

  const favoriteProviderIds = React.useMemo(
    () => buildFavoriteProviderIds(providers, favoriteProviderLookup),
    [favoriteProviderLookup, providers],
  );

  const offersByRequest = React.useMemo(() => buildOffersByRequest(myOffers), [myOffers]);

  const allMyContracts = React.useMemo(
    () => buildAllMyContracts(myProviderContracts, myClientContracts),
    [myClientContracts, myProviderContracts],
  );

  const favoriteProviderCityLabelById = React.useMemo(
    () => buildFavoriteProviderCityLabelById(favoriteProviders, cityById, locale),
    [cityById, favoriteProviders, locale],
  );

  const favoriteProviderRoleLabelById = React.useMemo(
    () => buildFavoriteProviderRoleLabelById(favoriteProviders, serviceByKey, locale),
    [favoriteProviders, locale, serviceByKey],
  );

  return {
    favoriteRequestIds,
    requestById,
    providerById,
    favoriteProviderLookup,
    favoriteProviderIds,
    offersByRequest,
    allMyContracts,
    favoriteProviderCityLabelById,
    favoriteProviderRoleLabelById,
  };
}
