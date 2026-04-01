import * as React from 'react';
import type { UseFormRegister } from 'react-hook-form';
import { CitySearchSelect } from '@/components/ui/CitySearchSelect';
import { Field } from '@/components/ui/Field';
import { FormLabel } from '@/components/ui/FormLabel';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { IconChevronDown, IconPin } from '@/components/ui/icons/icons';
import { IconCoins } from '@/components/ui/Icons';
import { ProviderAvailabilityMeta } from '@/components/providers/ProviderAvailabilityMeta';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { CreateRequestValues } from '@/features/request/create.schema';

type Translate = (key: I18nKey) => string;

type DirectFlowText = {
  calendarTitle: string;
  calendarHintLoading: string;
  calendarHintReady: string;
  calendarHintEmpty: string;
  selectedDateLabel: string;
  providerPrefix: string;
};

type CreateRequestDetailsSectionProps = {
  t: Translate;
  requiredHint: string;
  locale: 'de' | 'en';
  register: UseFormRegister<CreateRequestValues>;
  cityId: string;
  cityError?: string;
  preferredDateError?: string;
  areaError?: string;
  isDirectProviderFlow: boolean;
  providerId: string;
  directProviderDisplayName?: string | null;
  directFlowText: DirectFlowText;
  directAvailabilityLabel: string;
  directAvailabilityTone: 'success' | 'warning';
  selectedDateLabel: string;
  selectedDayIso: string;
  requestSelectedDateLabel: string;
  directFlowCalendarConfig: React.ComponentProps<typeof ProviderAvailabilityMeta>['calendar'];
  requestCalendarConfig: React.ComponentProps<typeof ProviderAvailabilityMeta>['calendar'];
  isDirectProviderLoading: boolean;
  isProviderSlotsLoading: boolean;
  availableDaysCount: number;
  isCleaningCategory: boolean;
  propertyType: CreateRequestValues['propertyType'];
  isRecurringValue: boolean;
  tags: string[];
  tagInput: string;
  onCityChange: (value: string) => void;
  onSelectDirectIsoDay: (nextIsoDay: string) => void;
  onSelectRequestIsoDay: (nextIsoDay: string) => void;
  onPropertyTypeChange: (value: CreateRequestValues['propertyType']) => void;
  onRecurringChange: (value: boolean) => void;
  onTagInputChange: (value: string) => void;
  onTagCommit: () => void;
  onTagRemove: (tag: string) => void;
};

export function CreateRequestDetailsSection({
  t,
  requiredHint,
  locale,
  register,
  cityId,
  cityError,
  preferredDateError,
  areaError,
  isDirectProviderFlow,
  providerId,
  directProviderDisplayName,
  directFlowText,
  directAvailabilityLabel,
  directAvailabilityTone,
  selectedDateLabel,
  selectedDayIso,
  requestSelectedDateLabel,
  directFlowCalendarConfig,
  requestCalendarConfig,
  isDirectProviderLoading,
  isProviderSlotsLoading,
  availableDaysCount,
  isCleaningCategory,
  propertyType,
  isRecurringValue,
  tags,
  tagInput,
  onCityChange,
  onSelectDirectIsoDay,
  onSelectRequestIsoDay,
  onPropertyTypeChange,
  onRecurringChange,
  onTagInputChange,
  onTagCommit,
  onTagRemove,
}: CreateRequestDetailsSectionProps) {
  return (
    <section className="request-section">
      <div className="request-section__header">
        <h2 className="section-title">{t(I18N_KEYS.request.sectionDetailsTitle)}</h2>
        <p className="section-subtitle">{t(I18N_KEYS.request.sectionDetailsSubtitle)}</p>
      </div>

      <div className="form-group">
        <FormLabel required requiredHint={requiredHint}>
          {t(I18N_KEYS.home.cityAria)}
        </FormLabel>
        <input type="hidden" value={cityId} readOnly {...register('cityId')} />
        <Field leftIcon={<IconPin />} rightIcon={<IconChevronDown />}>
          <CitySearchSelect
            locale={locale}
            value={cityId}
            onChange={onCityChange}
            placeholder={t(I18N_KEYS.home.cityPlaceholder)}
            ariaLabel={t(I18N_KEYS.home.cityAria)}
            searchPlaceholder={t(I18N_KEYS.home.cityPlaceholder)}
            loadingLabel={t(I18N_KEYS.common.refreshing)}
            emptyLabel={t(I18N_KEYS.common.noResults)}
            errorLabel={t(I18N_KEYS.common.loadErrorShort)}
          />
        </Field>
        {cityError ? (
          <p className="text-red-600 text-sm">{cityError}</p>
        ) : null}
      </div>

      <div className="request-form__row is-2">
        <div className="form-group">
          <FormLabel required requiredHint={requiredHint}>
            {t(I18N_KEYS.request.preferredDate)}
          </FormLabel>
          {isDirectProviderFlow ? (
            <div className="request-provider-calendar">
              <div className="request-provider-calendar__head">
                <p className="request-provider-calendar__title">{directFlowText.calendarTitle}</p>
                <p className="request-provider-calendar__provider">
                  {directFlowText.providerPrefix}:{' '}
                  <strong>{directProviderDisplayName?.trim() || providerId}</strong>
                </p>
              </div>
              <ProviderAvailabilityMeta
                stateLabel={directAvailabilityLabel}
                datePrefix={t(I18N_KEYS.homePublic.providerAvailabilityNextSlot)}
                dateLabel={selectedDateLabel}
                dateIso={selectedDayIso}
                tone={directAvailabilityTone}
                calendarLocale={locale}
                calendar={directFlowCalendarConfig}
                className="request-provider-calendar__availability"
                onSelectIsoDay={onSelectDirectIsoDay}
              />
              <p className="request-provider-calendar__selected">
                <span className="request-provider-calendar__selected-label">
                  {directFlowText.selectedDateLabel}:
                </span>{' '}
                <span className="request-provider-calendar__selected-value">{selectedDateLabel}</span>
              </p>
              <p className="request-provider-calendar__hint">
                {isDirectProviderLoading || isProviderSlotsLoading
                  ? directFlowText.calendarHintLoading
                  : availableDaysCount > 0
                    ? directFlowText.calendarHintReady
                    : directFlowText.calendarHintEmpty}
              </p>
              <input type="hidden" value={selectedDayIso ? `${selectedDayIso}T09:00` : ''} readOnly {...register('preferredDate')} />
            </div>
          ) : (
            <div className="request-provider-calendar">
              <ProviderAvailabilityMeta
                stateLabel={t(I18N_KEYS.homePublic.providerAvailabilityStateOpen)}
                datePrefix={t(I18N_KEYS.request.preferredDate)}
                dateLabel={requestSelectedDateLabel}
                dateIso={selectedDayIso}
                tone="success"
                calendarLocale={locale}
                calendar={requestCalendarConfig}
                showStateBadge={false}
                showDatePrefix={false}
                autoSelectFirstAvailable={false}
                className="request-provider-calendar__availability"
                onSelectIsoDay={onSelectRequestIsoDay}
              />
              <input type="hidden" value={selectedDayIso ? `${selectedDayIso}T09:00` : ''} readOnly {...register('preferredDate')} />
            </div>
          )}
          {preferredDateError ? (
            <p className="text-red-600 text-sm">{preferredDateError}</p>
          ) : null}
        </div>
        <div className="form-group">
          <label className="typo-small">{t(I18N_KEYS.request.priceLabel)}</label>
          <Field leftIcon={<IconCoins />}>
              <Input
                type="number"
                min={1}
                placeholder={t(I18N_KEYS.request.pricePlaceholder)}
                {...register('price', {
                  setValueAs: (value) => {
                    if (value === '' || value === undefined || value === null) return undefined;
                    const parsed = Number(value);
                    return Number.isFinite(parsed) ? parsed : undefined;
                  },
                })}
              />
            </Field>
          </div>
      </div>

      {isCleaningCategory ? (
        <>
          <div className="request-form__row is-2">
            <div className="form-group">
              <label className="typo-small">{t(I18N_KEYS.request.propertyType)}</label>
              <Field rightIcon={<IconChevronDown />}>
                <Select
                  value={propertyType}
                  onChange={(value) =>
                    onPropertyTypeChange(value as CreateRequestValues['propertyType'])
                  }
                  options={[
                    { value: 'apartment', label: t(I18N_KEYS.request.propertyApartment) },
                    { value: 'house', label: t(I18N_KEYS.request.propertyHouse) },
                  ]}
                />
              </Field>
            </div>
            <div className="form-group">
              <label className="typo-small">{t(I18N_KEYS.request.area)}</label>
              <Field>
                <Input
                  type="number"
                  min={10}
                  {...register('area', {
                    setValueAs: (value) => {
                      if (value === '' || value === undefined || value === null) return undefined;
                      const parsed = Number(value);
                      return Number.isFinite(parsed) ? parsed : undefined;
                    },
                  })}
                />
              </Field>
              {areaError ? (
                <p className="text-red-600 text-sm">{areaError}</p>
              ) : null}
            </div>
          </div>

          <div className="form-group">
            <label className="typo-small">{t(I18N_KEYS.request.recurring)}</label>
            <Field rightIcon={<IconChevronDown />}>
              <Select
                value={isRecurringValue ? 'recurring' : 'once'}
                onChange={(value) => onRecurringChange(value === 'recurring')}
                options={[
                  { value: 'once', label: t(I18N_KEYS.request.modeOnce) },
                  { value: 'recurring', label: t(I18N_KEYS.request.modeRecurring) },
                ]}
              />
            </Field>
          </div>
        </>
      ) : null}

      <div className="form-group">
        <label className="typo-small">{t(I18N_KEYS.request.tagsLabel)}</label>
        <div className="request-tags">
          {tags.map((tag) => (
            <span key={tag} className="request-tag-chip">
              {tag}
              <button type="button" onClick={() => onTagRemove(tag)}>
                ×
              </button>
            </span>
          ))}
          <Input
            className="request-tag-input"
            value={tagInput}
            onChange={(event) => onTagInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ',') {
                event.preventDefault();
                onTagCommit();
              }
            }}
            onBlur={onTagCommit}
            placeholder={t(I18N_KEYS.request.tagsPlaceholder)}
          />
        </div>
      </div>
    </section>
  );
}
