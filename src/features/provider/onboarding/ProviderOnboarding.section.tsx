'use client';

import * as React from 'react';
import type { UseFormRegister } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { FormLabel } from '@/components/ui/FormLabel';
import { Input } from '@/components/ui/Input';
import type { City, Service } from '@/features/catalog/model';
import type { ProviderOnboardingFormValues } from '@/features/provider/onboarding/types';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { pickI18n } from '@/lib/i18n/helpers';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useT } from '@/lib/i18n/useT';

type ProviderOnboardingSectionProps = {
  register: UseFormRegister<ProviderOnboardingFormValues>;
  requiredHint: string;
  cities: City[];
  services: Service[];
  selectedServiceKeys: string[];
  isCitiesLoading: boolean;
  isCitiesError: boolean;
  isServicesLoading: boolean;
  isServicesError: boolean;
  isSubmitting: boolean;
  cancelLabel: string;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
};

export function ProviderOnboardingSection({
  register,
  requiredHint,
  cities,
  services,
  selectedServiceKeys,
  isCitiesLoading,
  isCitiesError,
  isServicesLoading,
  isServicesError,
  isSubmitting,
  cancelLabel,
  onSubmit,
  onCancel,
}: ProviderOnboardingSectionProps) {
  const t = useT();
  const { locale } = useI18n();
  const citiesDisabled = isCitiesLoading || isCitiesError || isSubmitting;
  const servicesDisabled = isServicesLoading || isServicesError || isSubmitting;
  const submitDisabled = citiesDisabled || servicesDisabled;

  return (
    <>
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

      <form className="card stack-md" onSubmit={onSubmit}>
        <div className="stack-sm">
          <FormLabel required requiredHint={requiredHint}>
            {t(I18N_KEYS.provider.displayName)}
          </FormLabel>
          <Field>
            <Input required disabled={isSubmitting} {...register('displayName')} />
          </Field>
        </div>

        <div className="stack-sm">
          <label className="typo-small">{t(I18N_KEYS.provider.bio)}</label>
          <Field>
            <Input disabled={isSubmitting} {...register('bio')} />
          </Field>
        </div>

        <div className="stack-sm">
          <FormLabel required requiredHint={requiredHint}>
            {t(I18N_KEYS.provider.city)}
          </FormLabel>
          <Field>
            <select className="field" required disabled={citiesDisabled} {...register('cityId')}>
              <option value="">
                {isCitiesLoading
                  ? t(I18N_KEYS.common.refreshing)
                  : isCitiesError
                    ? t(I18N_KEYS.common.loadErrorShort)
                    : '—'}
              </option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {pickI18n(city.i18n, locale) || city.key}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="stack-sm">
          <FormLabel required requiredHint={requiredHint}>
            {t(I18N_KEYS.provider.basePrice)}
          </FormLabel>
          <Field>
            <Input
              type="number"
              min={10}
              required
              disabled={isSubmitting}
              {...register('basePrice', { valueAsNumber: true })}
            />
          </Field>
        </div>

        <div className="stack-sm">
          <FormLabel required requiredHint={requiredHint}>
            {t(I18N_KEYS.provider.services)}
          </FormLabel>
          <div className="stack-sm">
            <div className="flex flex-wrap gap-2">
              {services
                .filter((service) => selectedServiceKeys.includes(service.key))
                .map((service) => (
                  <span key={service.key} className="badge">
                    {pickI18n(service.i18n, locale) || service.key}
                  </span>
                ))}
            </div>
            {isServicesLoading ? <p className="typo-small">{t(I18N_KEYS.common.refreshing)}</p> : null}
            {isServicesError ? <p className="typo-small">{t(I18N_KEYS.common.loadError)}</p> : null}
            {!isServicesLoading && !isServicesError
              ? services.map((service) => (
                  <label key={service.key} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      value={service.key}
                      disabled={servicesDisabled}
                      {...register('serviceKeys')}
                    />
                    <span>{pickI18n(service.i18n, locale) || service.key}</span>
                  </label>
                ))
              : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={submitDisabled}>
            {t(I18N_KEYS.provider.onboardingCta)}
          </Button>
          <Button type="button" className="btn-secondary" onClick={onCancel} disabled={isSubmitting}>
            {cancelLabel}
          </Button>
        </div>
      </form>
    </>
  );
}
