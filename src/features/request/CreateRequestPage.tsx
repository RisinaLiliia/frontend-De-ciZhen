// src/features/request/CreateRequestPage.tsx
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { useCities, useServiceCategories, useServices } from '@/features/catalog/queries';
import { pickI18n } from '@/lib/i18n/helpers';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { createRequest, publishMyRequest, uploadRequestPhotos } from '@/lib/api/requests';
import { getPublicProviderById } from '@/lib/api/providers';
import { listProviderSlots } from '@/lib/api/availability';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { ApiError } from '@/lib/api/http-error';
import { parseScheduleParam } from '@/features/request/schedule';
import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import { createLongDateFormatter, parseDateSafe, toIsoDayLocal } from '@/lib/utils/date';
import {
  createRequestSchema,
  type CreateRequestValues,
} from '@/features/request/create.schema';
import {
  clearRequestDraft,
  readRequestDraft,
  writeRequestDraft,
  type RequestDraft,
} from '@/features/request/createDraft';
import {
  collectAvailableIsoDays,
  createInclusiveIsoDayRange,
  createIsoRangeFromToday,
  resolveProviderSlotsTimezone,
  resolveProviderTargetUserId,
  toPreferredDateValue,
} from '@/features/request/createRequestDate';
import { useRequestPhotoItems } from '@/features/request/useRequestPhotoItems';
import { CreateRequestBasicsSection } from '@/features/request/components/CreateRequestBasicsSection';
import { CreateRequestDetailsSection } from '@/features/request/components/CreateRequestDetailsSection';
import { CreateRequestActions } from '@/features/request/components/CreateRequestActions';

function CreateRequestContent() {
  const t = useT();
  const requiredHint = t(I18N_KEYS.common.requiredFieldHint);
  const router = useRouter();
  const searchParams = useSearchParams();
  const authStatus = useAuthStatus();
  const { locale } = useI18n();
  const localeTag = locale === 'de' ? 'de-DE' : 'en-US';
  const longDateFormatter = React.useMemo(
    () => createLongDateFormatter(localeTag),
    [localeTag],
  );

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

  const { data: cities } = useCities('DE');
  const { data: categories } = useServiceCategories();
  const { data: services } = useServices();
  const {
    data: directProvider,
    isLoading: isDirectProviderLoading,
  } = useQuery({
    queryKey: ['request-create-provider', providerId],
    enabled: isDirectProviderFlow,
    queryFn: () => getPublicProviderById(providerId),
  });
  const directProviderTargetUserId = React.useMemo(
    () => resolveProviderTargetUserId(directProvider),
    [directProvider],
  );
  const providerSlotsRange = React.useMemo(() => createIsoRangeFromToday(14), []);
  const requestCalendarRange = React.useMemo(() => createIsoRangeFromToday(180), []);
  const providerSlotsTimezone = React.useMemo(() => resolveProviderSlotsTimezone(), []);
  const {
    data: providerSlots = [],
    isLoading: isProviderSlotsLoading,
  } = useQuery({
    queryKey: [
      'request-create-provider-slots',
      directProviderTargetUserId,
      providerSlotsRange.from,
      providerSlotsRange.to,
      providerSlotsTimezone,
    ],
    enabled: isDirectProviderFlow && Boolean(directProviderTargetUserId),
    queryFn: () =>
      withStatusFallback(
        () =>
          listProviderSlots({
            providerUserId: String(directProviderTargetUserId),
            from: providerSlotsRange.from,
            to: providerSlotsRange.to,
            tz: providerSlotsTimezone,
          }),
        [],
        [400, 404],
      ),
    staleTime: 60_000,
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateRequestValues>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      serviceKey: defaultService,
      cityId: defaultCity,
      title: '',
      propertyType: 'apartment',
      area: 50,
      price: undefined,
      preferredDate,
      isRecurring,
      description: '',
      photos: [],
      tags: [],
    },
  });

  const serviceKey = useWatch({ control, name: 'serviceKey' });
  const cityId = useWatch({ control, name: 'cityId' });
  const watchedFormValues = useWatch({ control });
  const titleValue = useWatch({ control, name: 'title' }) ?? '';
  const descriptionValue = useWatch({ control, name: 'description' }) ?? '';
  const propertyType = useWatch({ control, name: 'propertyType' });
  const isRecurringValue = useWatch({ control, name: 'isRecurring' });
  const preferredDateValue = useWatch({ control, name: 'preferredDate' }) ?? '';

  const availableDaysSorted = React.useMemo(() => collectAvailableIsoDays(providerSlots), [providerSlots]);
  const availableDaySet = React.useMemo(() => new Set(availableDaysSorted), [availableDaysSorted]);
  const selectedDay = React.useMemo(() => {
    const parsed = parseDateSafe(preferredDateValue);
    if (!parsed) return undefined;
    parsed.setHours(0, 0, 0, 0);
    return parsed;
  }, [preferredDateValue]);
  const selectedDayIso = React.useMemo(
    () =>
      selectedDay
        ? toIsoDayLocal(selectedDay)
        : isDirectProviderFlow
          ? providerSlotsRange.from
          : '',
    [isDirectProviderFlow, providerSlotsRange.from, selectedDay],
  );

  const { photoItems, onFilesSelected, removePhotoAt } = useRequestPhotoItems({
    photosErrorMessage: t(I18N_KEYS.request.photosError),
    photosLimitMessage: t(I18N_KEYS.request.photosLimit),
  });
  const [tagInput, setTagInput] = React.useState('');
  const [tags, setTags] = React.useState<string[]>([]);
  const [activeSubmitIntent, setActiveSubmitIntent] = React.useState<'draft' | 'publish' | null>(null);

  React.useEffect(() => {
    setValue('tags', tags.length ? tags : undefined);
  }, [tags, setValue]);

  const [categoryKey, setCategoryKey] = React.useState('');
  const draftRestoredRef = React.useRef(false);

  React.useEffect(() => {
    if (typeof window === 'undefined' || draftRestoredRef.current) return;
    draftRestoredRef.current = true;
    const draft = readRequestDraft();
    if (!draft) return;

    const values = draft.values;
    if (typeof values.serviceKey === 'string') setValue('serviceKey', values.serviceKey);
    if (typeof values.cityId === 'string') setValue('cityId', values.cityId);
    if (typeof values.title === 'string') setValue('title', values.title);
    if (values.propertyType === 'apartment' || values.propertyType === 'house') {
      setValue('propertyType', values.propertyType);
    }
    if (typeof values.area === 'number' && Number.isFinite(values.area)) setValue('area', values.area);
    if (typeof values.price === 'number' && Number.isFinite(values.price)) {
      setValue('price', values.price);
    } else if (values.price === null || values.price === undefined) {
      setValue('price', undefined);
    }
    if (typeof values.preferredDate === 'string') setValue('preferredDate', values.preferredDate);
    if (typeof values.isRecurring === 'boolean') setValue('isRecurring', values.isRecurring);
    if (typeof values.description === 'string') setValue('description', values.description);

    if (Array.isArray(draft.tags)) {
      const safeTags = draft.tags.filter((item): item is string => typeof item === 'string');
      setTags(safeTags);
      setValue('tags', safeTags.length ? safeTags : undefined);
    }
    if (typeof draft.categoryKey === 'string') {
      setCategoryKey(draft.categoryKey);
    }
  }, [setValue]);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !draftRestoredRef.current) return;
    const payload: RequestDraft = {
      values: {
        serviceKey: watchedFormValues.serviceKey ?? '',
        cityId: watchedFormValues.cityId ?? '',
        title: watchedFormValues.title ?? '',
        propertyType: watchedFormValues.propertyType ?? 'apartment',
        area:
          typeof watchedFormValues.area === 'number' && Number.isFinite(watchedFormValues.area)
            ? watchedFormValues.area
            : 50,
        price:
          typeof watchedFormValues.price === 'number' && Number.isFinite(watchedFormValues.price)
            ? watchedFormValues.price
            : undefined,
        preferredDate: watchedFormValues.preferredDate ?? '',
        isRecurring: Boolean(watchedFormValues.isRecurring),
        description: watchedFormValues.description ?? '',
      },
      tags,
      categoryKey,
      savedAt: Date.now(),
    };
    writeRequestDraft(payload);
  }, [categoryKey, tags, watchedFormValues]);

  React.useEffect(() => {
    if (categoryKey) return;
    if (!serviceKey || !services) return;
    const service = services.find((item) => item.key === serviceKey);
    if (service) setCategoryKey(service.categoryKey);
  }, [categoryKey, serviceKey, services]);

  const isCleaningCategory = React.useMemo(() => {
    const key = `${categoryKey} ${serviceKey}`.toLowerCase();
    return key.includes('clean');
  }, [categoryKey, serviceKey]);

  const directFlowText = React.useMemo(
    () => ({
      calendarTitle: t(I18N_KEYS.request.directCalendarTitle),
      calendarHintLoading: t(I18N_KEYS.request.directCalendarHintLoading),
      calendarHintReady: t(I18N_KEYS.request.directCalendarHintReady),
      calendarHintEmpty: t(I18N_KEYS.request.directCalendarHintEmpty),
      selectedDateLabel: t(I18N_KEYS.request.directSelectedDateLabel),
      selectedDateEmpty: t(I18N_KEYS.request.directSelectedDateEmpty),
      providerPrefix: t(I18N_KEYS.request.directProviderPrefix),
      selectDateError: t(I18N_KEYS.request.directSelectDateError),
    }),
    [t],
  );
  const selectedDateLabel = React.useMemo(
    () => (selectedDay ? longDateFormatter.format(selectedDay) : directFlowText.selectedDateEmpty),
    [directFlowText.selectedDateEmpty, longDateFormatter, selectedDay],
  );
  const availabilityCalendarCopy = React.useMemo(
    () =>
      locale === 'de'
        ? {
            free: 'Frei',
            busy: 'Belegt',
            out: 'Außerhalb Zeitraum',
          }
        : {
            free: 'Free',
            busy: 'Busy',
            out: 'Outside range',
          },
    [locale],
  );
  const requestCalendarDays = React.useMemo(
    () => createInclusiveIsoDayRange(requestCalendarRange.from, requestCalendarRange.to),
    [requestCalendarRange.from, requestCalendarRange.to],
  );
  const requestCalendarConfig = React.useMemo(
    () => ({
      availableIsoDays: requestCalendarDays,
      rangeStartIso: requestCalendarRange.from,
      rangeEndIso: requestCalendarRange.to,
      title: t(I18N_KEYS.request.preferredDate),
      legendFree: availabilityCalendarCopy.free,
      legendBusy: availabilityCalendarCopy.busy,
      legendOut: availabilityCalendarCopy.out,
    }),
    [
      availabilityCalendarCopy.busy,
      availabilityCalendarCopy.free,
      availabilityCalendarCopy.out,
      requestCalendarDays,
      requestCalendarRange.from,
      requestCalendarRange.to,
      t,
    ],
  );
  const requestSelectedDateLabel = React.useMemo(() => {
    if (!selectedDay) return locale === 'de' ? 'TT.MM.JJJJ' : 'MM/DD/YYYY';
    return longDateFormatter.format(selectedDay);
  }, [locale, longDateFormatter, selectedDay]);
  const directFlowCalendarConfig = React.useMemo(
    () => ({
      availableIsoDays: availableDaysSorted,
      rangeStartIso: providerSlotsRange.from,
      rangeEndIso: providerSlotsRange.to,
      title: directFlowText.calendarTitle,
      legendFree: availabilityCalendarCopy.free,
      legendBusy: availabilityCalendarCopy.busy,
      legendOut: availabilityCalendarCopy.out,
    }),
    [
      availabilityCalendarCopy.busy,
      availabilityCalendarCopy.free,
      availabilityCalendarCopy.out,
      availableDaysSorted,
      directFlowText.calendarTitle,
      providerSlotsRange.from,
      providerSlotsRange.to,
    ],
  );
  const hasDirectAvailability = availableDaysSorted.length > 0;
  const directAvailabilityLabel = hasDirectAvailability
    ? t(I18N_KEYS.homePublic.providerAvailabilityStateOpen)
    : t(I18N_KEYS.homePublic.providerAvailabilityStateBusy);
  const directAvailabilityTone = hasDirectAvailability ? 'success' : 'warning';

  React.useEffect(() => {
    if (!isDirectProviderFlow) return;
    if (availableDaysSorted.length === 0) return;
    const current = parseDateSafe(preferredDateValue);
    const currentIso = current ? toIsoDayLocal(current) : '';
    if (currentIso && availableDaySet.has(currentIso)) return;
    setValue('preferredDate', toPreferredDateValue(availableDaysSorted[0]), {
      shouldDirty: false,
      shouldValidate: true,
    });
  }, [availableDaySet, availableDaysSorted, isDirectProviderFlow, preferredDateValue, setValue]);
  const onSubmit = async (values: CreateRequestValues, event?: React.BaseSyntheticEvent) => {
    const submitter = (event?.nativeEvent as SubmitEvent | undefined)?.submitter;
    const submitIntent =
      submitter instanceof HTMLButtonElement && submitter.value === 'draft' ? 'draft' : 'publish';
    setActiveSubmitIntent(submitIntent);

    if (authStatus !== 'authenticated') {
      toast.message(t(I18N_KEYS.requestDetails.loginRequired));
      const currentParams = new URLSearchParams(searchParams.toString());
      currentParams.set('intent', submitIntent);
      const nextPath = `/request/create${currentParams.toString() ? `?${currentParams.toString()}` : ''}`;
      router.push(`/auth/login?next=${encodeURIComponent(nextPath)}`);
      setActiveSubmitIntent(null);
      return;
    }

    try {
      if (isDirectProviderFlow) {
        const selected = parseDateSafe(values.preferredDate);
        const selectedIso = selected ? toIsoDayLocal(selected) : '';
        if (!selectedIso || !availableDaySet.has(selectedIso)) {
          toast.error(directFlowText.selectDateError);
          return;
        }
      }
      const preferredDateIso = values.preferredDate
        ? new Date(values.preferredDate).toISOString()
        : values.preferredDate;
      let uploads: { urls: string[] } = { urls: [] };
      if (photoItems.length > 0) {
        try {
          uploads = await uploadRequestPhotos(photoItems.map((item) => item.file));
        } catch (error) {
          if (error instanceof ApiError && error.status === 403) {
            uploads = { urls: [] };
            toast.message(t(I18N_KEYS.request.photosUploadForbidden));
          } else {
            throw error;
          }
        }
      }
      const res = await createRequest({
        ...values,
        preferredDate: preferredDateIso,
        description: values.description?.trim() || undefined,
        photos: uploads.urls.length ? uploads.urls : undefined,
        tags: values.tags?.length ? values.tags : undefined,
        price: values.price ?? undefined,
      });
      if (submitIntent === 'publish') {
        await publishMyRequest(res.id);
      }
      clearRequestDraft();
      toast.success(t(submitIntent === 'publish' ? I18N_KEYS.request.published : I18N_KEYS.request.created));
      router.push(submitIntent === 'publish' ? '/workspace?section=requests' : '/workspace?tab=my-requests');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        toast.message(t(I18N_KEYS.requestDetails.loginRequired));
        const currentParams = new URLSearchParams(searchParams.toString());
        currentParams.set('intent', submitIntent);
        const nextPath = `/request/create${currentParams.toString() ? `?${currentParams.toString()}` : ''}`;
        router.push(`/auth/login?next=${encodeURIComponent(nextPath)}`);
        return;
      }
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    } finally {
      setActiveSubmitIntent(null);
    }
  };

  const serviceOptions = React.useMemo(
    () => {
      const filtered = categoryKey
        ? (services ?? []).filter((s) => s.categoryKey === categoryKey)
        : [];
      return [
        { value: '', label: t(I18N_KEYS.request.subcategoryPlaceholder) },
        ...filtered
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((s) => ({
            value: s.key,
            label: pickI18n(s.i18n, locale),
          })),
      ];
    },
    [services, locale, t, categoryKey],
  );

  const categoryOptions = React.useMemo(
    () => [
      { value: '', label: t(I18N_KEYS.request.categoryPlaceholder) },
      ...(categories ?? [])
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((c) => ({
          value: c.key,
          label: pickI18n(c.i18n, locale),
        })),
    ],
    [categories, locale, t],
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

  const addTag = (value: string) => {
    const clean = value.trim();
    if (!clean) return;
    if (tags.includes(clean)) {
      setTagInput('');
      return;
    }
    setTags((prev) => [...prev, clean]);
    setTagInput('');
  };

  return (
    <PageShell right={<AuthActions />} withSpacer={false}>
      <div className="container-mobile request-create">
        <section className="text-center stack-sm">
          <h1 className="typo-h1">{t(I18N_KEYS.request.title)}</h1>
          <p className="typo-muted">{t(I18N_KEYS.request.subtitle)}</p>
        </section>

        <form className="card request-form" onSubmit={handleSubmit(onSubmit)}>
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
            serviceError={errors.serviceKey?.message?.toString()}
            titleError={errors.title?.message?.toString()}
            photoItems={photoItems}
            onCategoryChange={(value) => {
              setCategoryKey(value);
              setValue('serviceKey', '');
            }}
            onServiceChange={(value) => setValue('serviceKey', value)}
            onPhotosSelected={onFilesSelected}
            onPhotoRemove={removePhotoAt}
          />

          <CreateRequestDetailsSection
            t={t}
            requiredHint={requiredHint}
            locale={locale}
            register={register}
            cityId={cityId}
            cityOptions={cityOptions}
            cityError={errors.cityId?.message?.toString()}
            preferredDateError={errors.preferredDate?.message?.toString()}
            areaError={errors.area?.message?.toString()}
            isDirectProviderFlow={isDirectProviderFlow}
            providerId={providerId}
            directProviderDisplayName={directProvider?.displayName}
            directFlowText={{
              calendarTitle: directFlowText.calendarTitle,
              calendarHintLoading: directFlowText.calendarHintLoading,
              calendarHintReady: directFlowText.calendarHintReady,
              calendarHintEmpty: directFlowText.calendarHintEmpty,
              selectedDateLabel: directFlowText.selectedDateLabel,
              providerPrefix: directFlowText.providerPrefix,
            }}
            directAvailabilityLabel={directAvailabilityLabel}
            directAvailabilityTone={directAvailabilityTone}
            selectedDateLabel={selectedDateLabel}
            selectedDayIso={selectedDayIso}
            requestSelectedDateLabel={requestSelectedDateLabel}
            directFlowCalendarConfig={directFlowCalendarConfig}
            requestCalendarConfig={requestCalendarConfig}
            isDirectProviderLoading={isDirectProviderLoading}
            isProviderSlotsLoading={isProviderSlotsLoading}
            availableDaysCount={availableDaysSorted.length}
            isCleaningCategory={isCleaningCategory}
            propertyType={propertyType}
            isRecurringValue={isRecurringValue}
            tags={tags}
            tagInput={tagInput}
            onCityChange={(value) => setValue('cityId', value)}
            onSelectDirectIsoDay={(nextIsoDay) => {
              if (!availableDaySet.has(nextIsoDay)) return;
              setValue('preferredDate', toPreferredDateValue(nextIsoDay), {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
            onSelectRequestIsoDay={(nextIsoDay) => {
              setValue('preferredDate', toPreferredDateValue(nextIsoDay), {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
            onPropertyTypeChange={(value) => setValue('propertyType', value)}
            onRecurringChange={(value) => setValue('isRecurring', value)}
            onTagInputChange={setTagInput}
            onTagCommit={() => addTag(tagInput)}
            onTagRemove={(tag) => setTags((prev) => prev.filter((item) => item !== tag))}
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

export function CreateRequestPage() {
  return (
    <React.Suspense fallback={null}>
      <CreateRequestContent />
    </React.Suspense>
  );
}
