// src/features/request/CreateRequestPage.tsx
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { parseScheduleParam } from '@/features/request/schedule';
import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import { CreateRequestPageView } from '@/features/request/page/CreateRequestPageView';
import { useCreateRequestCatalogModel } from '@/features/request/page/useCreateRequestCatalogModel';
import { useCreateRequestFormModel } from '@/features/request/page/useCreateRequestFormModel';
import { useCreateRequestAvailabilityModel } from '@/features/request/page/useCreateRequestAvailabilityModel';
import { useCreateRequestSubmit } from '@/features/request/page/useCreateRequestSubmit';

function CreateRequestContent() {
  const t = useT();
  const requiredHint = t(I18N_KEYS.common.requiredFieldHint);
  const router = useRouter();
  const searchParams = useSearchParams();
  const authStatus = useAuthStatus();
  const { locale } = useI18n();

  const schedule = parseScheduleParam(searchParams.get('schedule') ?? undefined);
  const defaultService = searchParams.get('service') ?? '';
  const defaultCity = searchParams.get('city') ?? '';
  const providerId = (searchParams.get('providerId') ?? '').trim();
  const isDirectProviderFlow = providerId.length > 0;

  const isRecurring = schedule?.mode === 'recurring';
  const preferredDate =
    schedule?.mode === 'recurring'
      ? schedule.startDate
      : schedule?.mode === 'once'
        ? schedule.date
        : '';

  const formModel = useCreateRequestFormModel({
    t,
    defaultService,
    defaultCity,
    preferredDate,
    isRecurring,
  });
  const catalogModel = useCreateRequestCatalogModel({
    locale,
    t,
    categoryKey: formModel.categoryKey,
  });
  const {
    categoryKey,
    serviceKey,
    setCategoryKey,
  } = formModel;

  React.useEffect(() => {
    if (categoryKey) return;
    if (!serviceKey || !catalogModel.services) return;
    const service = catalogModel.services.find((item) => item.key === serviceKey);
    if (service) setCategoryKey(service.categoryKey);
  }, [catalogModel.services, categoryKey, serviceKey, setCategoryKey]);

  const availabilityModel = useCreateRequestAvailabilityModel({
    locale,
    t,
    providerId,
    isDirectProviderFlow,
    preferredDateValue: formModel.preferredDateValue,
    setValue: formModel.setValue,
  });

  const submitHandler = useCreateRequestSubmit({
    t,
    router,
    authStatus,
    searchParams,
    isDirectProviderFlow,
    availableDaySet: availabilityModel.availableDaySet,
    directSelectDateError: availabilityModel.directFlowText.selectDateError,
    photoItems: formModel.photoItems,
    onSubmitIntentChange: formModel.setActiveSubmitIntent,
    clearDraft: formModel.clearDraft,
  });

  return (
    <CreateRequestPageView
      t={t}
      requiredHint={requiredHint}
      locale={locale}
      onSubmit={formModel.handleSubmit(submitHandler)}
      register={formModel.register}
      categoryKey={formModel.categoryKey}
      serviceKey={formModel.serviceKey}
      cityId={formModel.cityId}
      categoryOptions={catalogModel.categoryOptions}
      serviceOptions={catalogModel.serviceOptions}
      titleValue={formModel.titleValue}
      descriptionValue={formModel.descriptionValue}
      serviceError={formModel.errors.serviceKey?.message?.toString()}
      titleError={formModel.errors.title?.message?.toString()}
      cityError={formModel.errors.cityId?.message?.toString()}
      preferredDateError={formModel.errors.preferredDate?.message?.toString()}
      areaError={formModel.errors.area?.message?.toString()}
      photoItems={formModel.photoItems}
      onCategoryChange={(value) => {
        formModel.setCategoryKey(value);
        formModel.setValue('serviceKey', '');
      }}
      onServiceChange={(value) => formModel.setValue('serviceKey', value)}
      onCityChange={(value) => formModel.setValue('cityId', value)}
      onPhotosSelected={formModel.onFilesSelected}
      onPhotoRemove={formModel.removePhotoAt}
      isDirectProviderFlow={isDirectProviderFlow}
      providerId={providerId}
      directProviderDisplayName={availabilityModel.directProvider?.displayName}
      directFlowText={{
        calendarTitle: availabilityModel.directFlowText.calendarTitle,
        calendarHintLoading: availabilityModel.directFlowText.calendarHintLoading,
        calendarHintReady: availabilityModel.directFlowText.calendarHintReady,
        calendarHintEmpty: availabilityModel.directFlowText.calendarHintEmpty,
        selectedDateLabel: availabilityModel.directFlowText.selectedDateLabel,
        providerPrefix: availabilityModel.directFlowText.providerPrefix,
      }}
      directAvailabilityLabel={availabilityModel.directAvailabilityLabel}
      directAvailabilityTone={availabilityModel.directAvailabilityTone}
      selectedDateLabel={availabilityModel.selectedDateLabel}
      selectedDayIso={availabilityModel.selectedDayIso}
      requestSelectedDateLabel={availabilityModel.requestSelectedDateLabel}
      directFlowCalendarConfig={availabilityModel.directFlowCalendarConfig}
      requestCalendarConfig={availabilityModel.requestCalendarConfig}
      isDirectProviderLoading={availabilityModel.isDirectProviderLoading}
      isProviderSlotsLoading={availabilityModel.isProviderSlotsLoading}
      availableDaysCount={availabilityModel.availableDaysSorted.length}
      isCleaningCategory={formModel.isCleaningCategory}
      propertyType={formModel.propertyType}
      isRecurringValue={formModel.isRecurringValue}
      tags={formModel.tags}
      tagInput={formModel.tagInput}
      onSelectDirectIsoDay={availabilityModel.selectDirectIsoDay}
      onSelectRequestIsoDay={availabilityModel.selectRequestIsoDay}
      onPropertyTypeChange={(value) => formModel.setValue('propertyType', value)}
      onRecurringChange={(value) => formModel.setValue('isRecurring', value)}
      onTagInputChange={formModel.setTagInput}
      onTagCommit={() => formModel.addTag(formModel.tagInput)}
      onTagRemove={(tag) => formModel.setTags((prev) => prev.filter((item) => item !== tag))}
      isSubmitting={formModel.isSubmitting}
      activeSubmitIntent={formModel.activeSubmitIntent}
    />
  );
}

export function CreateRequestPage() {
  return (
    <React.Suspense fallback={null}>
      <CreateRequestContent />
    </React.Suspense>
  );
}
