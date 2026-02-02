// src/components/request/WannPicker.tsx
"use client";

import * as React from "react";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { DateField, type DateValue } from "@/components/ui/DateField";
import { IconCalendar, IconChevronDown } from "@/components/ui/icons/icons";
import type { Schedule } from "@/features/request/when.schema";

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function toISODate(d?: Date): string {
  if (!d) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function fromISODate(s?: string): Date | undefined {
  if (!s) return undefined;
  const [y, m, d] = s.split("-").map((x) => Number(x));
  if (!y || !m || !d) return undefined;
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? undefined : dt;
}

type RecurringSchedule = Extract<Schedule, { mode: "recurring" }>;
type Frequency = RecurringSchedule["frequency"];
type TimesPerWeek = RecurringSchedule["timesPerWeek"];
type Weekday = RecurringSchedule["weekdays"][number];

const weekdayOptions: Array<{ value: Weekday; label: string }> = [
  { value: "mo", label: "Mo" },
  { value: "tu", label: "Di" },
  { value: "we", label: "Mi" },
  { value: "th", label: "Do" },
  { value: "fr", label: "Fr" },
  { value: "sa", label: "Sa" },
  { value: "su", label: "So" },
];

const frequencyOptions: Array<{ value: Frequency; label: string }> = [
  { value: "weekly", label: "Jede Woche" },
  { value: "biweekly", label: "Alle 2 Wochen" },
];

const timesPerWeekOptions: Array<{ value: TimesPerWeek; label: string }> = [
  { value: "1", label: "1× pro Woche" },
  { value: "2", label: "2× pro Woche" },
  { value: "3", label: "3× pro Woche" },
];

function isFrequency(value: string): value is Frequency {
  return value === "weekly" || value === "biweekly";
}

function isTimesPerWeek(value: string): value is TimesPerWeek {
  return value === "1" || value === "2" || value === "3";
}

function isWeekday(value: string): value is Weekday {
  return weekdayOptions.some((w) => w.value === value);
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
  const modeOptions = [
    { value: "once", label: "Einmalig" },
    { value: "recurring", label: "Regelmäßig" },
  ];

  const toggleWeekday = (code: string) => {
    if (value.mode !== "recurring") return;
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
    if (value.mode !== "once") return { mode: "single" };
    return { mode: "single", date: fromISODate(value.date) };
  }, [value]);

  const startDateValue: DateValue = React.useMemo(() => {
    if (value.mode !== "recurring") return { mode: "single" };
    return { mode: "single", date: fromISODate(value.startDate) };
  }, [value]);

  return (
    <div className="stack-sm">
      <Field leftIcon={<IconCalendar />} rightIcon={<IconChevronDown />}>
        <Select
          options={modeOptions}
          value={value.mode}
          onChange={(m) => {
            if (m === "once") {
              onChange({ mode: "once", date: todayISO() });
            } else {
              onChange({
                mode: "recurring",
                frequency: "weekly",
                timesPerWeek: "1",
                weekdays: ["mo"],
                startDate: todayISO(),
              });
            }
          }}
          aria-label="Wann Modus"
          disabled={disabled}
        />
      </Field>

      {value.mode === "once" ? (
        <DateField
          value={onceDateValue}
          onChange={(v) => {
            if (v.mode !== "single") return;
            onChange({ mode: "once", date: toISODate(v.date) });
          }}
          minDate={new Date()}
          disabled={disabled}
          placeholder="Datum wählen"
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
              aria-label="Frequenz"
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
              aria-label="Häufigkeit"
              disabled={disabled}
            />
          </Field>

          <div className="stack-sm">
            <p className="typo-small">Bevorzugte Wochentage</p>

            <div
              className="flex gap-2 overflow-x-auto -mx-1 px-1 py-1 sm:flex-wrap sm:overflow-visible sm:mx-0 sm:px-0"
              style={{ WebkitOverflowScrolling: "touch" }}
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
                      borderColor: active ? "transparent" : "var(--c-border)",
                      background: active
                        ? "color-mix(in oklab, var(--c-accent) 22%, transparent)"
                        : "var(--c-surface)",
                      color: "var(--c-text)",
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
              if (v.mode !== "single") return;
              onChange({ ...value, startDate: toISODate(v.date) });
            }}
            minDate={new Date()}
            disabled={disabled}
            placeholder="Startdatum wählen"
          />
        </>
      )}
    </div>
  );
}
