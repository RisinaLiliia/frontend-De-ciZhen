import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import type { UseFormSetValue } from 'react-hook-form';
import { getPublicProviderById } from '@/lib/api/providers';
import { listProviderSlots } from '@/lib/api/availability';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import type { I18nKey } from '@/lib/i18n/keys';
import { createLongDateFormatter, parseDateSafe, toIsoDayLocal } from '@/lib/utils/date';
import type { CreateRequestValues } from '@/features/request/create.schema';
import {
  collectAvailableIsoDays,
  createInclusiveIsoDayRange,
  createIsoRangeFromToday,
  resolveProviderSlotsTimezone,
  resolveProviderTargetUserId,
  toPreferredDateValue,
} from '@/features/request/createRequestDate';

type Translate = (key: I18nKey) => string;

type Params = {
  locale: 'de' | 'en';
  t: Translate;
  providerId: string;
  isDirectProviderFlow: boolean;
  preferredDateValue: string;
  setValue: UseFormSetValue<CreateRequestValues>;
};

export function useCreateRequestAvailabilityModel({
  locale,
  t,
  providerId,
  isDirectProviderFlow,
  preferredDateValue,
  setValue,
}: Params) {
  const localeTag = locale === 'de' ? 'de-DE' : 'en-US';
  const longDateFormatter = React.useMemo(
    () => createLongDateFormatter(localeTag),
    [localeTag],
  );

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

  const directFlowText = React.useMemo(
    () => ({
      calendarTitle: t('request.directCalendarTitle'),
      calendarHintLoading: t('request.directCalendarHintLoading'),
      calendarHintReady: t('request.directCalendarHintReady'),
      calendarHintEmpty: t('request.directCalendarHintEmpty'),
      selectedDateLabel: t('request.directSelectedDateLabel'),
      selectedDateEmpty: t('request.directSelectedDateEmpty'),
      providerPrefix: t('request.directProviderPrefix'),
      selectDateError: t('request.directSelectDateError'),
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
      title: t('request.preferredDate'),
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
    ? t('homePublic.providerAvailabilityStateOpen')
    : t('homePublic.providerAvailabilityStateBusy');
  const directAvailabilityTone: 'success' | 'warning' = hasDirectAvailability
    ? 'success'
    : 'warning';

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

  const selectDirectIsoDay = React.useCallback(
    (nextIsoDay: string) => {
      if (!availableDaySet.has(nextIsoDay)) return;
      setValue('preferredDate', toPreferredDateValue(nextIsoDay), {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [availableDaySet, setValue],
  );

  const selectRequestIsoDay = React.useCallback(
    (nextIsoDay: string) => {
      setValue('preferredDate', toPreferredDateValue(nextIsoDay), {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [setValue],
  );

  return {
    directProvider,
    isDirectProviderLoading,
    isProviderSlotsLoading,
    availableDaysSorted,
    availableDaySet,
    directFlowText,
    selectedDateLabel,
    requestSelectedDateLabel,
    selectedDayIso,
    requestCalendarConfig,
    directFlowCalendarConfig,
    directAvailabilityLabel,
    directAvailabilityTone,
    selectDirectIsoDay,
    selectRequestIsoDay,
  };
}
