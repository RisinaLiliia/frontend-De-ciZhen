'use client';

import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { de, enUS } from 'date-fns/locale';

import { Popover } from '@/components/ui/Popover';
import { IconCalendar } from '@/components/ui/icons/icons';
import { fromIsoDay, toIsoDayLocal } from '@/lib/utils/date';

type ProviderAvailabilityCalendarConfig = {
  availableIsoDays: string[];
  rangeStartIso: string;
  rangeEndIso: string;
  title: string;
  legendFree: string;
  legendBusy: string;
  legendOut: string;
};

type ProviderAvailabilityMetaProps = {
  stateLabel: string;
  datePrefix: string;
  dateLabel: string;
  dateIso: string;
  tone: 'success' | 'warning';
  calendarLocale?: 'de' | 'en';
  calendar?: ProviderAvailabilityCalendarConfig;
  className?: string;
};

export function ProviderAvailabilityMeta({
  stateLabel,
  datePrefix,
  dateLabel,
  dateIso,
  tone,
  calendarLocale = 'de',
  calendar,
  className,
}: ProviderAvailabilityMetaProps) {
  const [open, setOpen] = React.useState(false);
  const dayPickerLocale = calendarLocale === 'de' ? de : enUS;
  const availableSet = React.useMemo(
    () => new Set(calendar?.availableIsoDays ?? []),
    [calendar?.availableIsoDays],
  );
  const [selectedDay, setSelectedDay] = React.useState<Date | undefined>(undefined);

  React.useEffect(() => {
    if (!calendar) {
      setSelectedDay(undefined);
      return;
    }
    const nextSelectedIso = availableSet.has(dateIso)
      ? dateIso
      : calendar.availableIsoDays[0];
    if (!nextSelectedIso) {
      setSelectedDay(undefined);
      return;
    }
    setSelectedDay(fromIsoDay(nextSelectedIso));
  }, [availableSet, calendar, dateIso]);

  const triggerNode = (
    <span className={`request-detail__availability-date ${calendar ? 'request-detail__availability-date--interactive' : ''}`.trim()}>
      <IconCalendar />
      <span className="request-detail__availability-date-prefix">{datePrefix}:</span>
      <time dateTime={dateIso}>{dateLabel}</time>
    </span>
  );

  const calendarNode = calendar ? (
    <Popover
      open={open}
      onOpenChange={setOpen}
      align="end"
      className="request-detail__availability-calendar-popover"
      trigger={triggerNode}
    >
      <div className="dc-date request-detail__availability-calendar">
        <p className="request-detail__availability-calendar-title">{calendar.title}</p>
        <div className="dc-calendar">
          <DayPicker
            locale={dayPickerLocale}
            mode="single"
            selected={selectedDay}
            onSelect={(day) => {
              if (!day) return;
              const iso = toIsoDayLocal(day);
              if (!availableSet.has(iso)) return;
              setSelectedDay(fromIsoDay(iso));
            }}
            disabled={(day) => {
              const iso = toIsoDayLocal(day);
              return iso < calendar.rangeStartIso || iso > calendar.rangeEndIso;
            }}
            modifiers={{
              available: (day) => {
                const iso = toIsoDayLocal(day);
                return availableSet.has(iso);
              },
              busy: (day) => {
                const iso = toIsoDayLocal(day);
                return iso >= calendar.rangeStartIso && iso <= calendar.rangeEndIso && !availableSet.has(iso);
              },
            }}
            modifiersClassNames={{
              selected: 'request-detail__availability-day-selected',
              available: 'request-detail__availability-day-available',
              busy: 'request-detail__availability-day-busy',
            }}
            fromMonth={fromIsoDay(calendar.rangeStartIso)}
            toMonth={fromIsoDay(calendar.rangeEndIso)}
            defaultMonth={fromIsoDay(calendar.rangeStartIso)}
            showOutsideDays
          />
        </div>
        <div className="request-detail__availability-calendar-legend">
          <span className="request-detail__availability-legend-item">
            <span className="request-detail__availability-legend-dot is-free" aria-hidden="true" />
            {calendar.legendFree}
          </span>
          <span className="request-detail__availability-legend-item">
            <span className="request-detail__availability-legend-dot is-busy" aria-hidden="true" />
            {calendar.legendBusy}
          </span>
          <span className="request-detail__availability-legend-item">
            <span className="request-detail__availability-legend-dot is-out" aria-hidden="true" />
            {calendar.legendOut}
          </span>
        </div>
      </div>
    </Popover>
  ) : triggerNode;

  return (
    <div className={`request-detail__availability-meta ${className ?? ''}`.trim()}>
      <span className={`status-badge request-detail__availability-status ${tone === 'warning' ? 'status-badge--warning' : 'status-badge--success'}`.trim()}>
        <span className="request-detail__availability-dot" aria-hidden="true" />
        {stateLabel}
      </span>
      {calendarNode}
    </div>
  );
}
