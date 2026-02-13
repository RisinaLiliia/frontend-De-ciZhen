// src/features/request/RequestForm.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

import { Field } from '@/components/ui/Field';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { WannPicker } from '@/components/request/WannPicker';
import { IconSearch, IconPin, IconChevronDown } from '@/components/ui/icons/icons';
import { useCities, useServices } from '@/features/catalog/queries';
import type { Schedule } from './when.schema';
import { serializeSchedule } from './schedule';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { pickI18n } from '@/lib/i18n/helpers';

export function RequestForm() {
  const t = useT();
  const { locale } = useI18n();
  const {
    data: cities,
    isLoading: citiesLoading,
    isError: citiesIsError,
    refetch: refetchCities,
  } = useCities('DE');
  const {
    data: services,
    isLoading: servicesLoading,
    isError: servicesIsError,
    refetch: refetchServices,
  } = useServices();

  const loading = citiesLoading || servicesLoading;
  const hasError = citiesIsError || servicesIsError;

  const [serviceKey, setServiceKey] = React.useState('');
  const [cityId, setCityId] = React.useState('');
  const [schedule, setSchedule] = React.useState<Schedule>({ mode: 'once', date: '' });

  const hasToastedRef = React.useRef(false);
  React.useEffect(() => {
    if (hasError && !hasToastedRef.current) {
      hasToastedRef.current = true;
      toast.error(t(I18N_KEYS.common.loadError));
    }
    if (!hasError) hasToastedRef.current = false;
  }, [hasError, t]);

  const serviceOptions = React.useMemo(
    () => [
      { value: '', label: t(I18N_KEYS.home.servicePlaceholder) },
      ...(services ?? []).map((s) => ({
        value: s.key,
        label: pickI18n(s.i18n, locale),
      })),
    ],
    [services, locale, t],
  );

  const cityOptions = React.useMemo(
    () => [
      { value: '', label: t(I18N_KEYS.home.cityPlaceholder) },
      ...(cities ?? []).map((c) => ({
        value: c.id,
        label: pickI18n(c.i18n, locale),
      })),
    ],
    [cities, locale, t],
  );

  const canSubmit = Boolean(serviceKey && cityId);
  const scheduleParam = serializeSchedule(schedule);
  const href =
    `/request/create?service=${encodeURIComponent(serviceKey)}` +
    `&city=${encodeURIComponent(cityId)}` +
    `&schedule=${scheduleParam}`;

  const hasServices = (services ?? []).length > 0;
  const hasCities = (cities ?? []).length > 0;
  const isEmpty = !loading && !hasError && (!hasServices || !hasCities);
  const isDisabled = hasError || isEmpty;

  const onRetry = async () => {
    toast.message(t(I18N_KEYS.common.refreshing));
    await Promise.all([refetchCities(), refetchServices()]);
  };

  if (loading) {
    return (
      <section className="card stack-md">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </section>
    );
  }

  return (
    <section className="card stack-md">
      {hasError ? (
        <div className="stack-sm">
          <p className="typo-muted">{t(I18N_KEYS.common.loadErrorShort)}</p>
          <button className="btn-primary" type="button" onClick={onRetry}>
            {t(I18N_KEYS.common.retry)}
          </button>
        </div>
      ) : null}

      {isEmpty ? <p className="typo-muted">{t(I18N_KEYS.common.emptyData)}</p> : null}

      <Field leftIcon={<IconSearch />} rightIcon={<IconChevronDown />}>
        <Select
          options={serviceOptions}
          value={serviceKey}
          onChange={setServiceKey}
          aria-label={t(I18N_KEYS.home.serviceAria)}
          placeholder={t(I18N_KEYS.home.servicePlaceholder)}
          disabled={isDisabled}
        />
      </Field>

      <Field leftIcon={<IconPin />} rightIcon={<IconChevronDown />}>
        <Select
          options={cityOptions}
          value={cityId}
          onChange={setCityId}
          aria-label={t(I18N_KEYS.home.cityAria)}
          placeholder={t(I18N_KEYS.home.cityPlaceholder)}
          disabled={isDisabled}
        />
      </Field>

      <WannPicker value={schedule} onChange={setSchedule} disabled={isDisabled} />

      {isDisabled ? null : (
        <Link
          href={canSubmit ? href : '#'}
          aria-disabled={!canSubmit}
          className="btn-primary"
          onClick={(e) => {
            if (!canSubmit) {
              e.preventDefault();
              toast.message(t(I18N_KEYS.common.selectServiceCity));
            }
          }}
        >
          {t(I18N_KEYS.home.cta)}
        </Link>
      )}
    </section>
  );
}
