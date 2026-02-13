// src/app/provider/profile/page.tsx
'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { getMyProviderProfile, updateMyProviderProfile } from '@/lib/api/providers';
import { useCities, useServices } from '@/features/catalog/queries';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { listMyProviderOffers } from '@/lib/api/offers';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import Link from 'next/link';

export default function ProviderProfilePage() {
  const t = useT();
  const qc = useQueryClient();
  const { data: cities } = useCities('DE');
  const { data: services } = useServices();

  const { data, isLoading } = useQuery({
    queryKey: ['provider-profile'],
    queryFn: () => getMyProviderProfile(),
  });

  const { data: offers } = useQuery({
    queryKey: ['provider-offers'],
    queryFn: () => listMyProviderOffers(),
  });

  type ProfileFormValues = {
    displayName: string;
    bio: string;
    companyName: string;
    vatId: string;
    cityId: string;
    basePrice: number;
    serviceKeys: string[];
  };

  const { register, handleSubmit, reset } = useForm<ProfileFormValues>({
    defaultValues: {
      displayName: '',
      bio: '',
      companyName: '',
      vatId: '',
      cityId: '',
      basePrice: 40,
      serviceKeys: [] as string[],
    },
  });

  React.useEffect(() => {
    if (data) {
      reset({
        displayName: data.displayName || '',
        bio: data.bio || '',
        companyName: data.companyName || '',
        vatId: data.vatId || '',
        cityId: data.cityId || '',
        basePrice: data.basePrice ?? 40,
        serviceKeys: data.serviceKeys || [],
      });
    }
  }, [data, reset]);


  const onSubmit = async (values: ProfileFormValues) => {
    try {
      await updateMyProviderProfile({
        ...values,
        serviceKeys: values.serviceKeys || [],
        basePrice: Number(values.basePrice),
      });
      toast.success(t(I18N_KEYS.provider.profileSaved));
      await qc.invalidateQueries({ queryKey: ['provider-profile'] });
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    }
  };

  return (
    <PageShell right={<AuthActions />} withSpacer={false}>
      <section className="card stack-sm">
        <h1 className="typo-h2">{t(I18N_KEYS.provider.profileTitle)}</h1>
        <p className="typo-muted">{data?.displayName || t(I18N_KEYS.provider.unnamed)}</p>
      </section>

      <section className="card stack-sm">
        <h2 className="typo-h3">{t(I18N_KEYS.client.settingsTitle)}</h2>
        <div className="flex items-center justify-between">
          <span className="typo-small">{t(I18N_KEYS.common.themeLabel)}</span>
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-between">
          <span className="typo-small">{t(I18N_KEYS.auth.languageLabel)}</span>
          <LanguageToggle />
        </div>
      </section>

      <section className="card stack-sm">
        <div className="flex items-center justify-between">
          <h2 className="typo-h3">{t(I18N_KEYS.provider.myResponsesTitle)}</h2>
          <Link href="/provider/requests" className="typo-small">
            {t(I18N_KEYS.provider.viewRequests)}
          </Link>
        </div>
        <div className="stack-sm">
          {(offers ?? []).slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{item.requestServiceKey || item.requestId}</p>
                <p className="typo-small">{item.requestPreferredDate ?? ''}</p>
              </div>
              <span className="badge">{item.status}</span>
            </div>
          ))}
          {(offers ?? []).length === 0 ? (
            <p className="typo-muted">{t(I18N_KEYS.provider.responsesEmpty)}</p>
          ) : null}
        </div>
      </section>

      <section className="text-center stack-sm">
        <h2 className="typo-h3">{t(I18N_KEYS.provider.profileSubtitle)}</h2>
      </section>

      {isLoading ? <p className="typo-muted">{t(I18N_KEYS.common.refreshing)}</p> : null}

      <form className="card stack-md" onSubmit={handleSubmit(onSubmit)}>
            <div className="stack-sm">
              <label className="typo-small">{t(I18N_KEYS.provider.displayName)}</label>
              <Field>
                <Input {...register('displayName')} />
              </Field>
            </div>

            <div className="stack-sm">
              <label className="typo-small">{t(I18N_KEYS.provider.bio)}</label>
              <Field>
                <Input {...register('bio')} />
              </Field>
            </div>

            <div className="stack-sm">
              <label className="typo-small">{t(I18N_KEYS.provider.companyName)}</label>
              <Field>
                <Input {...register('companyName')} />
              </Field>
            </div>

            <div className="stack-sm">
              <label className="typo-small">{t(I18N_KEYS.provider.vatId)}</label>
              <Field>
                <Input {...register('vatId')} />
              </Field>
            </div>

            <div className="stack-sm">
              <label className="typo-small">{t(I18N_KEYS.provider.city)}</label>
              <Field>
                <select className="field" {...register('cityId')}>
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
                <Input type="number" min={10} {...register('basePrice')} />
              </Field>
            </div>

            <div className="stack-sm">
              <label className="typo-small">{t(I18N_KEYS.provider.services)}</label>
              <div className="stack-sm">
                <div className="flex flex-wrap gap-2">
                  {(services ?? [])
                    .filter((s) => (data?.serviceKeys || []).includes(s.key))
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

            <Button type="submit">{t(I18N_KEYS.provider.save)}</Button>
      </form>
    </PageShell>
  );
}
