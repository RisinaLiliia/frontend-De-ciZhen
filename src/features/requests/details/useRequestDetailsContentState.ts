'use client';

import type { QueryClient } from '@tanstack/react-query';

import type { ProviderProfileDto } from '@/lib/api/dto/providers';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { useRequestDetailsPresentation } from '@/features/requests/details/useRequestDetailsPresentation';
import { useRequestDetailsRelated } from '@/features/requests/details/useRequestDetailsRelated';
import { useRequestDetailsViewModel } from '@/features/requests/details/useRequestDetailsViewModel';
import { useRequestOwnerEdit } from '@/features/requests/details/useRequestOwnerEdit';

type Translate = (key: I18nKey) => string;

type UseRequestDetailsContentStateParams = {
  request: RequestResponseDto | null | undefined;
  locale: Locale;
  t: Translate;
  qc: QueryClient;
  isOwner: boolean;
  shouldOpenOwnerEdit: boolean;
  hasOffer: boolean;
  isOfferAccepted: boolean;
  providerProfile: ProviderProfileDto | null;
  isHydrated?: boolean;
};

export function useRequestDetailsContentState({
  request,
  locale,
  t,
  qc,
  isOwner,
  shouldOpenOwnerEdit,
  hasOffer,
  isOfferAccepted,
  providerProfile,
  isHydrated = true,
}: UseRequestDetailsContentStateParams) {
  const { viewModel, formatPriceValue } = useRequestDetailsViewModel({
    request,
    locale,
    t,
  });
  const {
    similarTitle,
    similarFallbackMessage,
    similarForRender,
    similarHref,
  } = useRequestDetailsRelated({
    request,
    locale,
    isHydrated,
    t,
  });
  const ownerEdit = useRequestOwnerEdit({
    request,
    isOwner,
    showOwnerBadge: isOwner,
    shouldOpenOwnerEdit,
    qc,
    t,
  });
  const presentation = useRequestDetailsPresentation({
    request,
    hasOffer,
    isOfferAccepted,
    providerProfile,
    t,
  });

  return {
    ...ownerEdit,
    ...presentation,
    formatPriceValue,
    similarFallbackMessage,
    similarForRender,
    similarHref,
    similarTitle,
    viewModel,
  };
}
