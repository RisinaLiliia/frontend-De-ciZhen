// src/app/provider/onboarding/ProviderOnboardingClient.tsx
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { RequireAuth } from '@/lib/auth/RequireAuth';
import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { getMyProviderProfile, updateMyProviderProfile } from '@/lib/api/providers';
import { useCities, useServices } from '@/features/catalog/queries';
import { useAuthSetLastMode } from '@/hooks/useAuthSnapshot';
import { useAuthStore } from '@/features/auth/store';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';

type ProfileFormValues = {
  displayName: string;
  bio: string;
  cityId: string;
  basePrice: number;
  serviceKeys: string[];
};

export function ProviderOnboardingClient() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const setLastMode = useAuthSetLastMode();
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const { data: cities } = useCities('DE');
  const { data: services } = useServices();

  const { data } = useQuery({
    queryKey: ['provider-profile'],
    queryFn: () => getMyProviderProfile(),
  });

  const { control, register, handleSubmit, reset } = useForm<ProfileFormValues>({
    defaultValues: {
      displayName: '',
      bio: '',
      cityId: '',
      basePrice: 40,
      serviceKeys: [],
    },
  });

  React.useEffect(() => {
    if (!data) return;
    reset({
      displayName: data.displayName || '',
      bio: data.bio || '',
      cityId: data.cityId || '',
      basePrice: data.basePrice ?? 40,
      serviceKeys: data.serviceKeys || [],
    });
  }, [data, reset]);

  const getNextPath = React.useCallback(() => {
    const next = searchParams?.get('next');
    if (next && next.startsWith('/')) return next;
    return '/provider/requests';
  }, [searchParams]);

  const selectedServiceKeys = useWatch({ control, name: 'serviceKeys' });

  const onSubmit = async (values: ProfileFormValues) => {
    if (!values.serviceKeys || values.serviceKeys.length === 0) {
      toast.error(t(I18N_KEYS.common.selectServiceCity));
      return;
    }
    try {
      await updateMyProviderProfile({
        displayName: values.displayName,
        bio: values.bio || undefined,
        cityId: values.cityId,
        basePrice: Number(values.basePrice),
        serviceKeys: values.serviceKeys || [],
      });
      await qc.invalidateQueries({ queryKey: ['provider-profile'] });
      await fetchMe();
      setLastMode('provider');
      toast.success(t(I18N_KEYS.provider.profileSaved));
      router.replace(getNextPath());
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    }
  };

  const cancelLabel = searchParams?.get('next')
    ? t(I18N_KEYS.provider.onboardingCancel)
    : t(I18N_KEYS.provider.onboardingSkip);

  const handleCancel = () => {
    router.replace(getNextPath());
  };

  return (
    <RequireAuth>
      <PageShell right={<AuthActions />}>
        <section className="card stack-sm">
          <h1 className="typo-h2">{t(I18N_KEYS.provider.onboardingTitle)}</h1>
          <p className="typo-muted">{t(I18N_KEYS.provider.onboardingSubtitle)}</p>
        </section>

        <section className="card stack-sm">
          <h2 className="typo-h3">{t(I18N_KEYS.provider.onboardingPitchTitle)}</h2>
          <ul className="stack-xs">
            <li className="typo-small">{t(I18N_KEYS.provider.onboardingPitch1)}</li>
            <li className="typo-small">{t(I18N_KEYS.provider.onboardingPitch2)}</li>
            <li className="typo-small">{t(I18N_KEYS.provider.onboardingPitch3)}</li>
          </ul>
        </section>

        <form className="card stack-md" onSubmit={handleSubmit(onSubmit)}>
          <div className="stack-sm">
            <label className="typo-small">{t(I18N_KEYS.provider.displayName)}</label>
            <Field>
              <Input required {...register('displayName')} />
            </Field>
          </div>

          <div className="stack-sm">
            <label className="typo-small">{t(I18N_KEYS.provider.bio)}</label>
            <Field>
              <Input {...register('bio')} />
            </Field>
          </div>

          <div className="stack-sm">
            <label className="typo-small">{t(I18N_KEYS.provider.city)}</label>
            <Field>
              <select className="field" required {...register('cityId')}>
                <option value="">—</option>
                {(cities ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.i18n?.de || c.i18n?.en || c.key}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="stack-sm">
            <label className="typo-small">{t(I18N_KEYS.provider.basePrice)}</label>
            <Field>
              <Input type="number" min={10} required {...register('basePrice')} />
            </Field>
          </div>

          <div className="stack-sm">
            <label className="typo-small">{t(I18N_KEYS.provider.services)}</label>
            <div className="stack-sm">
              <div className="flex flex-wrap gap-2">
                {(services ?? [])
                  .filter((s) => (selectedServiceKeys || []).includes(s.key))
                  .map((s) => (
                    <span key={s.key} className="badge">
                      {s.i18n?.de || s.i18n?.en || s.key}
                    </span>
                  ))}
              </div>
              {(services ?? []).map((s) => (
                <label key={s.key} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" value={s.key} {...register('serviceKeys')} />
                  <span>{s.i18n?.de || s.i18n?.en || s.key}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit">{t(I18N_KEYS.provider.onboardingCta)}</Button>
            <Button type="button" className="btn-secondary" onClick={handleCancel}>
              {cancelLabel}
            </Button>
          </div>
        </form>
      </PageShell>
    </RequireAuth>
  );
}
