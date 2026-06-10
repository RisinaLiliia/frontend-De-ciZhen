'use client';

import { useQuery } from '@tanstack/react-query';

import { usePublicProfileReviewsModel } from '@/features/reviews/usePublicProfileReviewsModel';
import type { CustomerPublicProfileSnapshot } from '@/features/customers/profile/customerPublicProfile.model';
import { getPublicCustomerById } from '@/lib/api/customers';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useT } from '@/lib/i18n/useT';

export type UseCustomerPublicProfileModelArgs = {
  customerId?: string | null;
  snapshot?: CustomerPublicProfileSnapshot | null;
};

export function useCustomerPublicProfileModel({
  customerId: customerIdProp = null,
  snapshot = null,
}: UseCustomerPublicProfileModelArgs) {
  const t = useT();
  const { locale } = useI18n();
  const customerId = customerIdProp?.trim() || snapshot?.userId?.trim() || null;

  const {
    data: customer,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['customer-public-profile', customerId],
    enabled: Boolean(customerId),
    queryFn: () => getPublicCustomerById(String(customerId)),
  });

  const displayName =
    customer?.displayName?.trim() ||
    snapshot?.displayName?.trim() ||
    t(I18N_KEYS.requestDetails.clientUnknown);
  const displayCity = customer?.cityName?.trim() || snapshot?.cityName?.trim() || undefined;
  const displayAvatarUrl = customer?.avatarUrl ?? snapshot?.avatarUrl ?? undefined;
  const displayIsOnline = customer?.isOnline ?? snapshot?.isOnline ?? false;
  const displayStatus: 'online' | 'offline' = displayIsOnline ? 'online' : 'offline';
  const displayStatusLabel = displayIsOnline
    ? t(I18N_KEYS.requestDetails.clientOnline)
    : t(I18N_KEYS.requestDetails.clientActive);
  const displayBio = customer?.bio?.trim() || snapshot?.bio?.trim() || null;
  const displayRatingAvg = customer?.ratingAvg ?? snapshot?.ratingAvg ?? 0;
  const displayRatingCount = customer?.ratingCount ?? snapshot?.ratingCount ?? 0;

  const reviewsModel = usePublicProfileReviewsModel({
    profileId: customerId ?? 'customer-public-profile',
    targetUserId: customerId,
    ratingAvg: displayRatingAvg,
    ratingCount: displayRatingCount,
    targetRole: 'client',
    locale,
    t,
  });

  return {
    t,
    locale,
    customer,
    customerId,
    isLoading,
    isError,
    displayName,
    displayCity,
    displayAvatarUrl,
    displayStatus,
    displayStatusLabel,
    displayBio,
    ...reviewsModel,
  };
}
