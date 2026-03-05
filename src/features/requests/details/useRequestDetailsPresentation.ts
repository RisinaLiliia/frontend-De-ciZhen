import * as React from 'react';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { ProviderProfileDto } from '@/lib/api/dto/providers';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';

type Translate = (key: I18nKey) => string;

type RequestStatusView = {
  token: 'in_progress' | 'completed' | 'cancelled' | 'sent';
  label: string;
};

type UseRequestDetailsPresentationParams = {
  request: RequestResponseDto | null | undefined;
  hasOffer: boolean;
  isOfferAccepted: boolean;
  providerProfile: ProviderProfileDto | null;
  t: Translate;
};

function resolveRequestStatusView(request: RequestResponseDto, t: Translate): RequestStatusView {
  if (request.status === 'matched') {
    return {
      token: 'in_progress',
      label: t(I18N_KEYS.requestDetails.statusInProgress),
    };
  }
  if (request.status === 'closed') {
    return {
      token: 'completed',
      label: t(I18N_KEYS.requestDetails.statusAccepted),
    };
  }
  if (request.status === 'cancelled') {
    return {
      token: 'cancelled',
      label: t(I18N_KEYS.requestDetails.statusCancelled),
    };
  }
  return {
    token: 'sent',
    label: t(I18N_KEYS.requestDetails.statusReview),
  };
}

function resolveRequestPriceTrend(request: RequestResponseDto): 'up' | 'down' | null {
  if (request.priceTrend === 'down' || request.priceTrend === 'up') return request.priceTrend;
  if (typeof request.previousPrice !== 'number' || typeof request.price !== 'number') return null;
  if (request.price < request.previousPrice) return 'down';
  if (request.price > request.previousPrice) return 'up';
  return null;
}

function resolveRequestPriceTrendLabel(request: RequestResponseDto, t: Translate): string | null {
  const trend = resolveRequestPriceTrend(request);
  if (trend === 'down') return t(I18N_KEYS.request.priceTrendDown);
  if (trend === 'up') return t(I18N_KEYS.request.priceTrendUp);
  return null;
}

function resolveProviderProfileComplete(providerProfile: ProviderProfileDto | null): boolean {
  if (!providerProfile) return false;
  if (typeof providerProfile.isProfileComplete === 'boolean') {
    return providerProfile.isProfileComplete;
  }
  const hasServices = Array.isArray(providerProfile.serviceKeys) && providerProfile.serviceKeys.length > 0;
  const hasBasePrice = typeof providerProfile.basePrice === 'number' && !Number.isNaN(providerProfile.basePrice);
  const hasIdentity = Boolean(providerProfile.displayName?.trim()) && Boolean(providerProfile.cityId?.trim());
  return hasServices && hasBasePrice && hasIdentity;
}

export function useRequestDetailsPresentation({
  request,
  hasOffer,
  isOfferAccepted,
  providerProfile,
  t,
}: UseRequestDetailsPresentationParams) {
  const applyLabel = React.useMemo(
    () =>
      isOfferAccepted
        ? t(I18N_KEYS.requestDetails.responseViewContract)
        : hasOffer
          ? t(I18N_KEYS.requestDetails.responseEditCta)
          : t(I18N_KEYS.requestDetails.ctaApply),
    [hasOffer, isOfferAccepted, t],
  );
  const applyState = React.useMemo<'accepted' | 'edit' | 'default'>(
    () => (isOfferAccepted ? 'accepted' : hasOffer ? 'edit' : 'default'),
    [hasOffer, isOfferAccepted],
  );
  const applyTitle = React.useMemo(
    () => (hasOffer ? t(I18N_KEYS.requestDetails.responseEditTooltip) : undefined),
    [hasOffer, t],
  );
  const viewOffersLabel = React.useMemo(
    () => t(I18N_KEYS.requestDetails.viewOffers),
    [t],
  );
  const requestStatusView = React.useMemo(
    () =>
      request
        ? resolveRequestStatusView(request, t)
        : {
            token: 'sent',
            label: t(I18N_KEYS.requestDetails.statusReview),
          },
    [request, t],
  );
  const requestPriceTrend = React.useMemo(
    () => (request ? resolveRequestPriceTrend(request) : null),
    [request],
  );
  const requestPriceTrendLabel = React.useMemo(
    () => (request ? resolveRequestPriceTrendLabel(request, t) : null),
    [request, t],
  );
  const isProviderProfileComplete = React.useMemo(
    () => resolveProviderProfileComplete(providerProfile),
    [providerProfile],
  );

  return {
    applyLabel,
    applyState,
    applyTitle,
    viewOffersLabel,
    requestStatusView,
    requestPriceTrend,
    requestPriceTrendLabel,
    isProviderProfileComplete,
  };
}
