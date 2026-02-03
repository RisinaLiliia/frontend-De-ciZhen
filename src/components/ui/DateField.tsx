// src/components/ui/DateField.tsx
'use client';

import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

import { de } from 'date-fns/locale';
import { format } from 'date-fns';

import { cn } from '@/lib/utils/cn';
import { Popover } from '@/components/ui/Popover';
import { Field } from '@/components/ui/Field';
import { IconCalendar, IconChevronDown } from '@/components/ui/icons/icons';
import { IconX } from '@/components/ui/icons/IconX';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';

export type DateValue = { mode: 'single'; date?: Date } | { mode: 'range'; from?: Date; to?: Date };

function formatDe(d?: Date) {
  return d ? format(d, 'dd.MM.yyyy', { locale: de }) : '';
}

export function DateField({
  value,
  onChange,
  minDate,
  disabled,
  placeholder,
  className,
  modeToggle,
}: {
  value: DateValue;
  onChange: (v: DateValue) => void;
  minDate?: Date;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  modeToggle?: boolean;
}) {
  const t = useT();
  const [open, setOpen] = React.useState(false);

  const label =
    value.mode === 'single'
      ? value.date
        ? formatDe(value.date)
        : ''
      : value.from || value.to
        ? `${formatDe(value.from)} — ${formatDe(value.to)}`
        : '';

  const trigger = (
    <Field leftIcon={<IconCalendar />} rightIcon={<IconChevronDown />} className={className}>
      <button
        type="button"
        className={cn(
          'field text-left flex items-center justify-between',
          disabled ? 'opacity-60' : '',
        )}
        disabled={disabled}
        aria-label={t(I18N_KEYS.dateField.ariaLabel)}
      >
        <span style={{ color: label ? 'var(--c-text)' : 'var(--c-muted)' }}>
          {label || placeholder || t(I18N_KEYS.dateField.placeholder)}
        </span>
        {label ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onChange(
                value.mode === 'single'
                  ? { mode: 'single', date: undefined }
                  : { mode: 'range', from: undefined, to: undefined },
              );
            }}
            className="ml-3 inline-flex items-center justify-center"
            aria-hidden
          >
            <IconX />
          </span>
        ) : null}
      </button>
    </Field>
  );

  return (
    <Popover open={open} onOpenChange={setOpen} trigger={trigger} align="start">
      <div className="stack-sm dc-date">
        {modeToggle ? (
          <div className="flex gap-2">
            <button
              type="button"
              className="h-10 px-3 rounded-md border text-sm"
              style={{
                borderColor: 'var(--c-border)',
                background:
                  value.mode === 'single'
                    ? 'color-mix(in oklab, var(--c-accent) 18%, transparent)'
                    : 'var(--c-surface)',
                color: 'var(--c-text)',
              }}
              onClick={() =>
                onChange({
                  mode: 'single',
                  date: value.mode === 'single' ? value.date : value.from,
                })
              }
            >
              {t(I18N_KEYS.dateField.single)}
            </button>
            <button
              type="button"
              className="h-10 px-3 rounded-md border text-sm"
              style={{
                borderColor: 'var(--c-border)',
                background:
                  value.mode === 'range'
                    ? 'color-mix(in oklab, var(--c-accent) 18%, transparent)'
                    : 'var(--c-surface)',
                color: 'var(--c-text)',
              }}
              onClick={() =>
                onChange({
                  mode: 'range',
                  from: value.mode === 'range' ? value.from : value.date,
                  to: value.mode === 'range' ? value.to : undefined,
                })
              }
            >
              {t(I18N_KEYS.dateField.range)}
            </button>
          </div>
        ) : null}

        <div className="dc-calendar">
          {value.mode === 'single' ? (
            <DayPicker
              mode="single"
              selected={value.date}
              onSelect={(date) => {
                onChange({ mode: 'single', date: date ?? undefined });
                if (date) setOpen(false);
              }}
              locale={de}
              weekStartsOn={1}
              disabled={minDate ? { before: minDate } : undefined}
              showOutsideDays
            />
          ) : (
            <DayPicker
              mode="range"
              selected={{ from: value.from, to: value.to }}
              onSelect={(range) => {
                onChange({ mode: 'range', from: range?.from, to: range?.to });
                if (range?.from && range?.to) setOpen(false);
              }}
              locale={de}
              weekStartsOn={1}
              disabled={minDate ? { before: minDate } : undefined}
              showOutsideDays
            />
          )}
        </div>

        <div className="dc-date-hint">
          <span>{t(I18N_KEYS.dateField.hintWeek)}</span>
          <span>•</span>
          <span>{t(I18N_KEYS.dateField.hintLocale)}</span>
          <span>•</span>
          <span>{t(I18N_KEYS.dateField.hintEsc)}</span>
        </div>
      </div>
    </Popover>
  );
}
