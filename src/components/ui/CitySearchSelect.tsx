'use client';

import * as React from 'react';

import { useCities } from '@/features/catalog/queries';
import { pickI18n } from '@/lib/i18n/helpers';
import type { Locale } from '@/lib/i18n/t';
import { cn } from '@/lib/utils/cn';
import { IconChevronDown } from '@/components/ui/icons/icons';
import { Input } from './Input';
import { Popover } from './Popover';

export type CitySearchOption = {
  value: string;
  label: string;
};

type CitySearchSelectProps = {
  locale: Locale;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
  countryCode?: string;
  allOption?: CitySearchOption;
  onSelectOption?: (option: CitySearchOption) => void;
  loadingLabel?: string;
  emptyLabel?: string;
  errorLabel?: string;
  searchPlaceholder?: string;
  initialLimit?: number;
  searchLimit?: number;
};

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebounced(value);
    }, delayMs);

    return () => window.clearTimeout(timeoutId);
  }, [delayMs, value]);

  return debounced;
}

function dedupeOptions(options: CitySearchOption[]) {
  const unique = new Map<string, CitySearchOption>();
  for (const option of options) {
    if (!option.value || unique.has(option.value)) continue;
    unique.set(option.value, option);
  }
  return Array.from(unique.values());
}

export function CitySearchSelect({
  locale,
  value,
  onChange,
  placeholder,
  ariaLabel,
  disabled = false,
  className,
  countryCode = 'DE',
  allOption,
  onSelectOption,
  loadingLabel = 'Loading…',
  emptyLabel = 'No results',
  errorLabel = 'Data could not be loaded.',
  searchPlaceholder = 'Search city…',
  initialLimit = 12,
  searchLimit = 8,
}: CitySearchSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);
  const listboxId = React.useId();
  const stateId = React.useId();
  const debouncedQuery = useDebouncedValue(query.trim(), 180);
  const selectedIds =
    value && (!allOption || value !== allOption.value)
      ? [value]
      : [];

  const {
    data: selectedCities = [],
    isError: isSelectedCitiesError,
  } = useCities(countryCode, {
    enabled: !disabled && selectedIds.length > 0,
    ids: selectedIds,
    limit: selectedIds.length || 1,
  });
  const {
    data: browseCities = [],
    isLoading,
    isError: isBrowseCitiesError,
  } = useCities(countryCode, {
    enabled: !disabled && open,
    query: debouncedQuery || undefined,
    limit: debouncedQuery ? searchLimit : initialLimit,
  });
  const isError = isSelectedCitiesError || isBrowseCitiesError;

  const cityOptions = React.useMemo<CitySearchOption[]>(() => {
    const mapped = [...selectedCities, ...browseCities]
      .map((city) => ({
        value: city.id,
        label: pickI18n(city.i18n, locale) || city.key,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, locale));

    return allOption
      ? [allOption, ...dedupeOptions(mapped)]
      : dedupeOptions(mapped);
  }, [allOption, browseCities, locale, selectedCities]);

  const selectedOption = React.useMemo(
    () => cityOptions.find((option) => option.value === value) ?? null,
    [cityOptions, value],
  );

  React.useEffect(() => {
    if (!open) {
      setQuery('');
      setActiveIndex(-1);
      return;
    }

    const id = window.setTimeout(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    }, 0);

    return () => window.clearTimeout(id);
  }, [open]);

  const visibleOptions = React.useMemo(
    () => (allOption ? cityOptions : cityOptions.filter((option) => option.value !== '')),
    [allOption, cityOptions],
  );
  const activeOption = activeIndex >= 0 ? visibleOptions[activeIndex] ?? null : null;
  const activeOptionId = activeOption
    ? `${listboxId}-option-${activeIndex}`
    : undefined;
  const stateMessage = isLoading
    ? loadingLabel
    : isError
      ? errorLabel
      : visibleOptions.length === 0
        ? emptyLabel
        : null;

  React.useEffect(() => {
    if (!open || isLoading || isError || visibleOptions.length === 0) {
      setActiveIndex(-1);
      return;
    }

    setActiveIndex((current) => {
      if (current >= 0 && current < visibleOptions.length) {
        return current;
      }

      const selectedIndex = visibleOptions.findIndex((option) => option.value === value);
      return selectedIndex >= 0 ? selectedIndex : 0;
    });
  }, [isError, isLoading, open, value, visibleOptions]);

  React.useEffect(() => {
    if (!activeOptionId) return;
    document.getElementById(activeOptionId)?.scrollIntoView?.({ block: 'nearest' });
  }, [activeOptionId]);

  const triggerLabel = selectedOption?.label ?? placeholder;
  const selectOption = React.useCallback((option: CitySearchOption) => {
    onChange(option.value);
    onSelectOption?.(option);
    setOpen(false);
  }, [onChange, onSelectOption]);
  const handleInputKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (visibleOptions.length === 0 || isLoading || isError) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % visibleOptions.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? visibleOptions.length - 1 : current - 1));
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      setActiveIndex(visibleOptions.length - 1);
      return;
    }

    if (event.key === 'Enter' && activeOption) {
      event.preventDefault();
      selectOption(activeOption);
    }
  }, [activeOption, isError, isLoading, selectOption, visibleOptions]);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      disabled={disabled}
      className={cn('dc-city-search', className)}
      trigger={(
        <div className={cn('field dc-select-trigger dc-city-search-trigger', disabled && 'is-disabled')}>
          <span className={cn('dc-city-search-trigger__label', !selectedOption && 'is-placeholder')}>
            {triggerLabel}
          </span>
          <IconChevronDown />
        </div>
      )}
    >
      <div className="dc-city-search-panel">
        <Input
          ref={searchInputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder={searchPlaceholder}
          aria-label={ariaLabel}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
          aria-describedby={stateMessage ? stateId : undefined}
          className="dc-city-search-input"
          autoComplete="off"
        />

        <div
          id={listboxId}
          className="dc-city-search-results"
          role="listbox"
          aria-label={ariaLabel}
          aria-busy={isLoading}
        >
          {stateMessage ? (
            <p id={stateId} className="dc-city-search-state" role="status" aria-live="polite">
              {stateMessage}
            </p>
          ) : (
            visibleOptions.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = option.value === activeOption?.value;
              const optionId = `${listboxId}-option-${index}`;
              return (
                <button
                  id={optionId}
                  key={option.value}
                  type="button"
                  className={cn('dc-city-search-option', isSelected && 'is-selected', isActive && 'is-active')}
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(visibleOptions.findIndex((item) => item.value === option.value))}
                  onClick={() => selectOption(option)}
                >
                  {option.label}
                </button>
              );
            })
          )}
        </div>
      </div>
    </Popover>
  );
}
