// src/app/request/new/page.tsx
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useCities, useServices } from '@/features/catalog/queries';
import { pickI18n } from '@/lib/i18n/helpers';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { createRequest } from '@/lib/api/requests';
import { parseScheduleParam } from '@/features/request/schedule';
import {
  createRequestSchema,
  type CreateRequestValues,
} from '@/features/request/create.schema';

function CreateRequestContent() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useI18n();

  const schedule = parseScheduleParam(searchParams.get('schedule') ?? undefined);
  const defaultService = searchParams.get('service') ?? '';
  const defaultCity = searchParams.get('city') ?? '';

  const isRecurring = schedule?.mode === 'recurring';
  const preferredDate =
    schedule?.mode === 'recurring'
      ? schedule.startDate
      : schedule?.mode === 'once'
        ? schedule.date
        : '';

  const { data: cities } = useCities('DE');
  const { data: services } = useServices();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateRequestValues>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      serviceKey: defaultService,
      cityId: defaultCity,
      propertyType: 'apartment',
      area: 50,
      preferredDate,
      isRecurring,
      comment: '',
    },
  });

  const serviceKey = watch('serviceKey');
  const cityId = watch('cityId');

  const onSubmit = async (values: CreateRequestValues) => {
    try {
      const preferredDateIso = values.preferredDate
        ? new Date(values.preferredDate).toISOString()
        : values.preferredDate;
      const res = await createRequest({
        ...values,
        preferredDate: preferredDateIso,
        comment: values.comment || undefined,
      });
      toast.success(t(I18N_KEYS.request.created));
      router.push(`/offers/${res.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    }
  };

  const serviceOptions = React.useMemo(
    () => [
      { value: '', label: t(I18N_KEYS.home.servicePlaceholder) },
      ...(services ?? []).map((s) => ({
        value: s.key,
        label: pickI18n(s.i18n, locale),
      })),
    ],
    [services, locale],
  );

  const cityOptions = React.useMemo(
    () => [
      { value: '', label: t(I18N_KEYS.home.cityPlaceholder) },
      ...(cities ?? []).map((c) => ({
        value: c.id,
        label: pickI18n(c.i18n, locale),
      })),
    ],
    [cities, locale],
  );

  return (
    <PageShell right={<AuthActions />} withSpacer={false}>
      <div className="stack-lg">
          <section className="text-center stack-sm">
            <h1 className="typo-h2">{t(I18N_KEYS.request.title)}</h1>
            <p className="typo-muted">{t(I18N_KEYS.request.subtitle)}</p>
          </section>

          <form className="card stack-md" onSubmit={handleSubmit(onSubmit)}>
            <p className="typo-small text-center">{t(I18N_KEYS.request.hint)}</p>
            <div className="stack-sm">
              <label className="typo-small">{t(I18N_KEYS.home.serviceAria)}</label>
              <Field>
                <Select
                  value={serviceKey}
                  onChange={(value) => setValue('serviceKey', value)}
                  options={serviceOptions}
                />
              </Field>
              {errors.serviceKey ? (
                <p className="text-red-600 text-sm">{errors.serviceKey.message}</p>
              ) : null}
            </div>

            <div className="stack-sm">
              <label className="typo-small">{t(I18N_KEYS.home.cityAria)}</label>
              <Field>
                <Select
                  value={cityId}
                  onChange={(value) => setValue('cityId', value)}
                  options={cityOptions}
                />
              </Field>
              {errors.cityId ? (
                <p className="text-red-600 text-sm">{errors.cityId.message}</p>
              ) : null}
            </div>

            <div className="stack-sm">
              <label className="typo-small">{t(I18N_KEYS.request.propertyType)}</label>
              <Field>
                <Select
                  value={watch('propertyType')}
                  onChange={(value) =>
                    setValue('propertyType', value as CreateRequestValues['propertyType'])
                  }
                  options={[
                    { value: 'apartment', label: t(I18N_KEYS.request.propertyApartment) },
                    { value: 'house', label: t(I18N_KEYS.request.propertyHouse) },
                  ]}
                />
              </Field>
            </div>

            <div className="stack-sm">
              <label className="typo-small">{t(I18N_KEYS.request.area)}</label>
              <Field>
                <Input type="number" min={10} {...register('area', { valueAsNumber: true })} />
              </Field>
              {errors.area ? <p className="text-red-600 text-sm">{errors.area.message}</p> : null}
            </div>

            <div className="stack-sm">
              <label className="typo-small">{t(I18N_KEYS.request.preferredDate)}</label>
              <Field>
                <Input type="date" {...register('preferredDate')} />
              </Field>
              {errors.preferredDate ? (
                <p className="text-red-600 text-sm">{errors.preferredDate.message}</p>
              ) : null}
            </div>

            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" {...register('isRecurring')} />
              {t(I18N_KEYS.request.recurring)}
            </label>

            <div className="stack-sm">
              <label className="typo-small">{t(I18N_KEYS.request.comment)}</label>
              <Field>
                <Input {...register('comment')} />
              </Field>
            </div>

            <Button type="submit" loading={isSubmitting}>
              {t(I18N_KEYS.request.submit)}
            </Button>
          </form>
      </div>
    </PageShell>
  );
}

export default function CreateRequestPage() {
  return (
    <React.Suspense fallback={null}>
      <CreateRequestContent />
    </React.Suspense>
  );
}
