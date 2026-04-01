'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { useServices } from '@/features/catalog/queries';
import { ProviderOnboardingSection } from '@/features/provider/onboarding/ProviderOnboarding.section';
import type { ProviderOnboardingFormValues } from '@/features/provider/onboarding/types';
import { providerQK, useMyProviderProfile } from '@/features/provider/queries';
import { useAuthStore } from '@/features/auth/store';
import { useAuthSetLastMode } from '@/hooks/useAuthSnapshot';
import { updateMyProviderProfile } from '@/lib/api/providers';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useT } from '@/lib/i18n/useT';

const DEFAULT_NEXT_PATH = '/provider/requests';

export function ProviderOnboardingContainer() {
  const t = useT();
  const requiredHint = t(I18N_KEYS.common.requiredFieldHint);
  const router = useRouter();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const setLastMode = useAuthSetLastMode();
  const fetchMe = useAuthStore((state) => state.fetchMe);

  const {
    data: services = [],
    isLoading: isServicesLoading,
    isError: isServicesError,
  } = useServices();
  const { data: providerProfile } = useMyProviderProfile();

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<ProviderOnboardingFormValues>({
    defaultValues: {
      displayName: '',
      bio: '',
      cityId: '',
      basePrice: 40,
      serviceKeys: [],
    },
  });

  React.useEffect(() => {
    if (!providerProfile) return;
    reset({
      displayName: providerProfile.displayName || '',
      bio: providerProfile.bio || '',
      cityId: providerProfile.cityId || '',
      basePrice: providerProfile.basePrice ?? 40,
      serviceKeys: providerProfile.serviceKeys || [],
    });
  }, [providerProfile, reset]);

  const nextPath = React.useMemo(() => {
    const next = searchParams?.get('next');
    if (next && next.startsWith('/')) return next;
    return DEFAULT_NEXT_PATH;
  }, [searchParams]);

  const hasNextParam = Boolean(searchParams?.get('next'));
  const cityIdValue = watch('cityId') ?? '';
  const selectedServiceKeys = useWatch({ control, name: 'serviceKeys' }) ?? [];
  const cancelLabel = hasNextParam
    ? t(I18N_KEYS.provider.onboardingCancel)
    : t(I18N_KEYS.provider.onboardingSkip);

  const onSubmit = React.useCallback(
    async (values: ProviderOnboardingFormValues) => {
      if (!values.serviceKeys || values.serviceKeys.length === 0) {
        toast.error(t(I18N_KEYS.common.selectServiceCity));
        return;
      }

      try {
        await updateMyProviderProfile({
          displayName: values.displayName,
          bio: values.bio || undefined,
          cityId: values.cityId,
          basePrice: values.basePrice,
          serviceKeys: values.serviceKeys || [],
        });
        await qc.invalidateQueries({ queryKey: providerQK.myProfile() });
        await fetchMe();
        setLastMode('provider');
        toast.success(t(I18N_KEYS.provider.profileSaved));
        router.replace(nextPath);
      } catch (error) {
        const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
        toast.error(message);
      }
    },
    [fetchMe, nextPath, qc, router, setLastMode, t],
  );

  const handleCancel = React.useCallback(() => {
    router.replace(nextPath);
  }, [nextPath, router]);

  return (
    <ProviderOnboardingSection
      register={register}
      cityIdValue={cityIdValue}
      requiredHint={requiredHint}
      services={services}
      selectedServiceKeys={selectedServiceKeys}
      isServicesLoading={isServicesLoading}
      isServicesError={isServicesError}
      isSubmitting={isSubmitting}
      cancelLabel={cancelLabel}
      onCityChange={(value) => {
        setValue('cityId', value, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }}
      onSubmit={handleSubmit(onSubmit)}
      onCancel={handleCancel}
    />
  );
}
