// src/components/request/WannPicker.tsx
'use client';

import * as React from 'react';
import { Field } from '@/components/ui/Field';
import { Select } from '@/components/ui/Select';
import { DateField, type DateValue } from '@/components/ui/DateField';
import { IconCalendar, IconChevronDown } from '@/components/ui/icons/icons';
import type { Schedule } from '@/features/request/when.schema';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function toISODate(d?: Date): string {
  if (!d) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function fromISODate(s?: string): Date | undefined {
  if (!s) return undefined;
  const [y, m, d] = s.split('-').map((x) => Number(x));
  if (!y || !m || !d) return undefined;
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? undefined : dt;
}

type RecurringSchedule = Extract<Schedule, { mode: 'recurring' }>;
type Frequency = RecurringSchedule['frequency'];
type TimesPerWeek = RecurringSchedule['timesPerWeek'];
type Weekday = RecurringSchedule['weekdays'][number];

function isFrequency(value: string): value is Frequency {
  return value === 'weekly' || value === 'biweekly';
}

function isTimesPerWeek(value: string): value is TimesPerWeek {
  return value === '1' || value === '2' || value === '3';
}

export function WannPicker({
  value,
  onChange,
  disabled,
}: {
  value: Schedule;
  onChange: (next: Schedule) => void;
  disabled?: boolean;
}) {
  const t = useT();

  const weekdayOptions: Array<{ value: Weekday; label: string }> = [
    { value: 'mo', label: t(I18N_KEYS.request.weekdays.mo) },
    { value: 'tu', label: t(I18N_KEYS.request.weekdays.tu) },
    { value: 'we', label: t(I18N_KEYS.request.weekdays.we) },
    { value: 'th', label: t(I18N_KEYS.request.weekdays.th) },
    { value: 'fr', label: t(I18N_KEYS.request.weekdays.fr) },
    { value: 'sa', label: t(I18N_KEYS.request.weekdays.sa) },
    { value: 'su', label: t(I18N_KEYS.request.weekdays.su) },
  ];

  const frequencyOptions: Array<{ value: Frequency; label: string }> = [
    { value: 'weekly', label: t(I18N_KEYS.request.frequencyWeekly) },
    { value: 'biweekly', label: t(I18N_KEYS.request.frequencyBiweekly) },
  ];

  const timesPerWeekOptions: Array<{ value: TimesPerWeek; label: string }> = [
    { value: '1', label: t(I18N_KEYS.request.timesPerWeek1) },
    { value: '2', label: t(I18N_KEYS.request.timesPerWeek2) },
    { value: '3', label: t(I18N_KEYS.request.timesPerWeek3) },
  ];

  const isWeekday = (value: string): value is Weekday => {
    return weekdayOptions.some((w) => w.value === value);
  };

  const modeOptions = [
    { value: 'once', label: t(I18N_KEYS.request.modeOnce) },
    { value: 'recurring', label: t(I18N_KEYS.request.modeRecurring) },
  ];

  const toggleWeekday = (code: string) => {
    if (value.mode !== 'recurring') return;
    if (!isWeekday(code)) return;

    const set = new Set<Weekday>(value.weekdays);
    if (set.has(code)) {
      set.delete(code);
    } else {
      set.add(code);
    }

    onChange({ ...value, weekdays: Array.from(set) });
  };

  const onceDateValue: DateValue = React.useMemo(() => {
    if (value.mode !== 'once') return { mode: 'single' };
    return { mode: 'single', date: fromISODate(value.date) };
  }, [value]);

  const startDateValue: DateValue = React.useMemo(() => {
    if (value.mode !== 'recurring') return { mode: 'single' };
    return { mode: 'single', date: fromISODate(value.startDate) };
  }, [value]);

  return (
    <div className="stack-sm">
      <Field leftIcon={<IconCalendar />} rightIcon={<IconChevronDown />}>
        <Select
          options={modeOptions}
          value={value.mode}
          onChange={(m) => {
            if (m === 'once') {
              onChange({ mode: 'once', date: todayISO() });
            } else {
              onChange({
                mode: 'recurring',
                frequency: 'weekly',
                timesPerWeek: '1',
                weekdays: ['mo'],
                startDate: todayISO(),
              });
            }
          }}
          aria-label={t(I18N_KEYS.request.whenModeLabel)}
          disabled={disabled}
        />
      </Field>

      {value.mode === 'once' ? (
        <DateField
          value={onceDateValue}
          onChange={(v) => {
            if (v.mode !== 'single') return;
            onChange({ mode: 'once', date: toISODate(v.date) });
          }}
          minDate={new Date()}
          disabled={disabled}
          placeholder={t(I18N_KEYS.request.datePlaceholder)}
        />
      ) : (
        <>
          <Field rightIcon={<IconChevronDown />}>
            <Select
              options={frequencyOptions}
              value={value.frequency}
              onChange={(v) => {
                if (isFrequency(v)) onChange({ ...value, frequency: v });
              }}
              aria-label={t(I18N_KEYS.request.frequencyLabel)}
              disabled={disabled}
            />
          </Field>

          <Field rightIcon={<IconChevronDown />}>
            <Select
              options={timesPerWeekOptions}
              value={value.timesPerWeek}
              onChange={(v) => {
                if (isTimesPerWeek(v)) onChange({ ...value, timesPerWeek: v });
              }}
              aria-label={t(I18N_KEYS.request.timesPerWeekLabel)}
              disabled={disabled}
            />
          </Field>

          <div className="stack-sm">
            <p className="typo-small">{t(I18N_KEYS.request.weekdaysLabel)}</p>

            <div
              className="flex gap-2 overflow-x-auto -mx-1 px-1 py-1 sm:flex-wrap sm:overflow-visible sm:mx-0 sm:px-0"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {weekdayOptions.map((w) => {
                const active = value.weekdays.includes(w.value);

                return (
                  <button
                    key={w.value}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleWeekday(w.value)}
                    className="h-9 shrink-0 px-2.5 rounded-md border text-sm transition sm:h-10 sm:px-3"
                    style={{
                      borderColor: active ? 'transparent' : 'var(--c-border)',
                      background: active
                        ? 'color-mix(in oklab, var(--c-accent) 22%, transparent)'
                        : 'var(--c-surface)',
                      color: 'var(--c-text)',
                    }}
                  >
                    {w.label}
                  </button>
                );
              })}
            </div>
          </div>

          <DateField
            value={startDateValue}
            onChange={(v) => {
              if (v.mode !== 'single') return;
              onChange({ ...value, startDate: toISODate(v.date) });
            }}
            minDate={new Date()}
            disabled={disabled}
            placeholder={t(I18N_KEYS.request.startDatePlaceholder)}
          />
        </>
      )}
    </div>
  );
}
