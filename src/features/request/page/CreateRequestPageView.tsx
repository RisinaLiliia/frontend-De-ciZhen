import * as React from 'react';
import type { UseFormRegister } from 'react-hook-form';
import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { CreateRequestBasicsSection } from '@/features/request/components/CreateRequestBasicsSection';
import { CreateRequestDetailsSection } from '@/features/request/components/CreateRequestDetailsSection';
import { CreateRequestActions } from '@/features/request/components/CreateRequestActions';
import type { CreateRequestValues } from '@/features/request/create.schema';
import type { Option } from '@/components/ui/Select';
import type { RequestPhotoItem } from '@/features/request/useRequestPhotoItems';
import type { I18nKey } from '@/lib/i18n/keys';

type Translate = (key: I18nKey) => string;

type Props = {
  t: Translate;
  requiredHint: string;
  locale: 'de' | 'en';
  onSubmit: (event?: React.BaseSyntheticEvent) => void | Promise<void>;
  register: UseFormRegister<CreateRequestValues>;
  categoryKey: string;
  serviceKey: string;
  cityId: string;
  categoryOptions: Option[];
  serviceOptions: Option[];
  titleValue: string;
  descriptionValue: string;
  serviceError?: string;
  titleError?: string;
  cityError?: string;
  preferredDateError?: string;
  areaError?: string;
  photoItems: RequestPhotoItem[];
  onCategoryChange: (value: string) => void;
  onServiceChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onPhotosSelected: (files: FileList | null) => void | Promise<void>;
  onPhotoRemove: (index: number) => void;
  isDirectProviderFlow: boolean;
  providerId: string;
  directProviderDisplayName?: string | null;
  directFlowText: {
    calendarTitle: string;
    calendarHintLoading: string;
    calendarHintReady: string;
    calendarHintEmpty: string;
    selectedDateLabel: string;
    providerPrefix: string;
  };
  directAvailabilityLabel: string;
  directAvailabilityTone: 'success' | 'warning';
  selectedDateLabel: string;
  selectedDayIso: string;
  requestSelectedDateLabel: string;
  directFlowCalendarConfig: React.ComponentProps<typeof CreateRequestDetailsSection>['directFlowCalendarConfig'];
  requestCalendarConfig: React.ComponentProps<typeof CreateRequestDetailsSection>['requestCalendarConfig'];
  isDirectProviderLoading: boolean;
  isProviderSlotsLoading: boolean;
  availableDaysCount: number;
  isCleaningCategory: boolean;
  propertyType: CreateRequestValues['propertyType'];
  isRecurringValue: boolean;
  tags: string[];
  tagInput: string;
  onSelectDirectIsoDay: (nextIsoDay: string) => void;
  onSelectRequestIsoDay: (nextIsoDay: string) => void;
  onPropertyTypeChange: (value: CreateRequestValues['propertyType']) => void;
  onRecurringChange: (value: boolean) => void;
  onTagInputChange: (value: string) => void;
  onTagCommit: () => void;
  onTagRemove: (tag: string) => void;
  isSubmitting: boolean;
  activeSubmitIntent: 'draft' | 'publish' | null;
};

export function CreateRequestPageView({
  t,
  requiredHint,
  locale,
  onSubmit,
  register,
  categoryKey,
  serviceKey,
  cityId,
  categoryOptions,
  serviceOptions,
  titleValue,
  descriptionValue,
  serviceError,
  titleError,
  cityError,
  preferredDateError,
  areaError,
  photoItems,
  onCategoryChange,
  onServiceChange,
  onCityChange,
  onPhotosSelected,
  onPhotoRemove,
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
  onSelectDirectIsoDay,
  onSelectRequestIsoDay,
  onPropertyTypeChange,
  onRecurringChange,
  onTagInputChange,
  onTagCommit,
  onTagRemove,
  isSubmitting,
  activeSubmitIntent,
}: Props) {
  return (
    <PageShell right={<AuthActions />} withSpacer={false}>
      <div className="container-mobile request-create">
        <section className="text-center stack-sm">
          <h1 className="typo-h1">{t('request.title')}</h1>
          <p className="typo-muted">{t('request.subtitle')}</p>
        </section>

        <form className="card request-form" onSubmit={onSubmit}>
          <CreateRequestBasicsSection
            t={t}
            requiredHint={requiredHint}
            register={register}
            categoryKey={categoryKey}
            serviceKey={serviceKey}
            categoryOptions={categoryOptions}
            serviceOptions={serviceOptions}
            titleValue={titleValue}
            descriptionValue={descriptionValue}
            serviceError={serviceError}
            titleError={titleError}
            photoItems={photoItems}
            onCategoryChange={onCategoryChange}
            onServiceChange={onServiceChange}
            onPhotosSelected={onPhotosSelected}
            onPhotoRemove={onPhotoRemove}
          />

          <CreateRequestDetailsSection
            t={t}
            requiredHint={requiredHint}
            locale={locale}
            register={register}
            cityId={cityId}
            cityError={cityError}
            preferredDateError={preferredDateError}
            areaError={areaError}
            isDirectProviderFlow={isDirectProviderFlow}
            providerId={providerId}
            directProviderDisplayName={directProviderDisplayName}
            directFlowText={directFlowText}
            directAvailabilityLabel={directAvailabilityLabel}
            directAvailabilityTone={directAvailabilityTone}
            selectedDateLabel={selectedDateLabel}
            selectedDayIso={selectedDayIso}
            requestSelectedDateLabel={requestSelectedDateLabel}
            directFlowCalendarConfig={directFlowCalendarConfig}
            requestCalendarConfig={requestCalendarConfig}
            isDirectProviderLoading={isDirectProviderLoading}
            isProviderSlotsLoading={isProviderSlotsLoading}
            availableDaysCount={availableDaysCount}
            isCleaningCategory={isCleaningCategory}
            propertyType={propertyType}
            isRecurringValue={isRecurringValue}
            tags={tags}
            tagInput={tagInput}
            onCityChange={onCityChange}
            onSelectDirectIsoDay={onSelectDirectIsoDay}
            onSelectRequestIsoDay={onSelectRequestIsoDay}
            onPropertyTypeChange={onPropertyTypeChange}
            onRecurringChange={onRecurringChange}
            onTagInputChange={onTagInputChange}
            onTagCommit={onTagCommit}
            onTagRemove={onTagRemove}
          />

          <CreateRequestActions
            t={t}
            isSubmitting={isSubmitting}
            activeSubmitIntent={activeSubmitIntent}
          />
        </form>
      </div>
    </PageShell>
  );
}
