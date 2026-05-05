'use client';

import type { ContractDto } from '@/lib/api/dto/contracts';
import type { OfferDto } from '@/lib/api/dto/offers';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { I18nMap } from '@/lib/i18n/helpers';
import type { Locale } from '@/lib/i18n/t';
import {
  buildAllMyContracts,
  buildFavoriteProviderCityLabelById,
  buildFavoriteProviderIds,
  buildFavoriteProviderRoleLabelById,
  buildFavoriteRequestIds,
  buildOffersByRequest,
  buildProviderById,
  buildProviderFavoriteLookup,
  buildRequestById,
} from '@/features/workspace/private/workspaceCollections.selectors';

type WorkspaceCollectionsCatalog = {
  cityById: ReadonlyMap<string, { i18n: I18nMap }>;
  serviceByKey: ReadonlyMap<string, { i18n: I18nMap }>;
};

export type WorkspaceCollectionsArgs = {
  includeRequestCollections?: boolean;
  requests: RequestResponseDto[];
  favoriteRequests: RequestResponseDto[];
  providers: ProviderPublicDto[];
  favoriteProviders: ProviderPublicDto[];
  myOffers: OfferDto[];
  myProviderContracts: ContractDto[];
  myClientContracts: ContractDto[];
  cityById: WorkspaceCollectionsCatalog['cityById'];
  serviceByKey: WorkspaceCollectionsCatalog['serviceByKey'];
  locale: Locale;
};

export function buildWorkspaceCollections({
  includeRequestCollections = true,
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
}: WorkspaceCollectionsArgs) {
  const favoriteRequestIds = includeRequestCollections
    ? buildFavoriteRequestIds(favoriteRequests)
    : new Set<string>();
  const requestById = includeRequestCollections
    ? buildRequestById(requests, favoriteRequests)
    : new Map<string, RequestResponseDto>();
  const providerById = buildProviderById(providers, favoriteProviders);
  const favoriteProviderLookup = buildProviderFavoriteLookup(favoriteProviders);
  const favoriteProviderIds = buildFavoriteProviderIds(providers, favoriteProviderLookup);
  const offersByRequest = includeRequestCollections
    ? buildOffersByRequest(myOffers)
    : new Map<string, OfferDto>();
  const allMyContracts = includeRequestCollections
    ? buildAllMyContracts(myProviderContracts, myClientContracts)
    : [];
  const favoriteProviderCityLabelById = buildFavoriteProviderCityLabelById(
    favoriteProviders,
    cityById,
    locale,
  );
  const favoriteProviderRoleLabelById = buildFavoriteProviderRoleLabelById(
    favoriteProviders,
    serviceByKey,
    locale,
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
