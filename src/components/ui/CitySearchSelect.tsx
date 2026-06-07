'use client';

import * as React from 'react';

import { useCities } from '@/features/catalog/queries';
import { pickI18n } from '@/lib/i18n/helpers';
import type { Locale } from '@/lib/i18n/t';
import { cn } from '@/lib/utils/cn';
import { IconCheck, IconChevronDown, IconPin } from '@/components/ui/icons/icons';
import { Input } from './Input';
import { Popover } from './Popover';

export type CitySearchOption = {
  value: string;
  label: string;
  meta?: string;
};

type CitySearchSelectProps = {
  mode?: 'popover' | 'inline';
  inlineBehavior?: 'listbox' | 'auto';
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

function extractPostalSearchToken(value: string): string {
  return value.match(/\b\d{3,10}\b/)?.[0] ?? '';
}

function buildCityOptionMeta(postalCodes: string[], stateName: string | null, districtName: string | null, query: string) {
  const postalToken = extractPostalSearchToken(query);
  const matchedPostalCode =
    postalCodes.find((postalCode) => postalToken && postalCode.startsWith(postalToken))
    ?? postalCodes[0]
    ?? '';
  const regionLabel = stateName?.trim() || districtName?.trim() || '';

  return [matchedPostalCode, regionLabel].filter(Boolean).join(' · ');
}

export function CitySearchSelect({
  mode = 'popover',
  inlineBehavior = 'listbox',
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
  const isInline = mode === 'inline';
  const isAutoResolveInline = isInline && inlineBehavior === 'auto';
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
    enabled: !disabled && (
      isInline
        ? (isAutoResolveInline ? debouncedQuery.length > 0 : open || debouncedQuery.length > 0)
        : open
    ),
    query: debouncedQuery || undefined,
    limit: debouncedQuery ? searchLimit : initialLimit,
  });
  const isError = isSelectedCitiesError || isBrowseCitiesError;

  const mappedSelectedOptions = React.useMemo<CitySearchOption[]>(() => (
    selectedCities
      .map((city) => ({
        value: city.id,
        label: pickI18n(city.i18n, locale) || city.name || city.key,
        meta: buildCityOptionMeta(city.postalCodes, city.stateName, city.districtName, debouncedQuery),
      }))
  ), [debouncedQuery, locale, selectedCities]);
  const mappedBrowseOptions = React.useMemo<CitySearchOption[]>(() => (
    browseCities.map((city) => ({
      value: city.id,
      label: pickI18n(city.i18n, locale) || city.name || city.key,
      meta: buildCityOptionMeta(city.postalCodes, city.stateName, city.districtName, debouncedQuery),
    }))
  ), [browseCities, debouncedQuery, locale]);

  const selectedOption = React.useMemo(
    () => dedupeOptions([...mappedSelectedOptions, ...mappedBrowseOptions]).find((option) => option.value === value) ?? null,
    [mappedBrowseOptions, mappedSelectedOptions, value],
  );

  const cityOptions = React.useMemo<CitySearchOption[]>(() => {
    const baseOptions = debouncedQuery.length > 0
      ? mappedBrowseOptions
      : [...mappedSelectedOptions, ...mappedBrowseOptions].sort((a, b) => a.label.localeCompare(b.label, locale));

    return allOption
      ? [allOption, ...dedupeOptions(baseOptions)]
      : dedupeOptions(baseOptions);
  }, [allOption, debouncedQuery.length, locale, mappedBrowseOptions, mappedSelectedOptions]);

  React.useEffect(() => {
    if (isInline) return;
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
  }, [isInline, open]);

  const visibleOptions = React.useMemo(
    () => (allOption ? cityOptions : cityOptions.filter((option) => option.value !== '')),
    [allOption, cityOptions],
  );
  const activeOption = activeIndex >= 0 ? visibleOptions[activeIndex] ?? null : null;
  const activeOptionId = activeOption
    ? `${listboxId}-option-${activeIndex}`
    : undefined;
  const previewId = React.useId();
  const stateMessage = isLoading
    ? loadingLabel
    : isError
      ? errorLabel
      : visibleOptions.length === 0
        ? emptyLabel
        : null;
  const bestInlineOption = isAutoResolveInline && debouncedQuery.length > 0
    ? visibleOptions.find((option) => !allOption || option.value !== allOption.value) ?? null
    : null;

  const commitInlineOption = React.useCallback((option: CitySearchOption | null) => {
    if (!option) return;
    onChange(option.value);
    onSelectOption?.(option);
    setQuery('');
    setOpen(false);
    setActiveIndex(-1);
  }, [onChange, onSelectOption]);

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
    setQuery('');
    setOpen(false);
  }, [onChange, onSelectOption]);
  const handleInputKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      setOpen(true);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setQuery('');
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (isAutoResolveInline) {
      if (event.key === 'Enter' && bestInlineOption) {
        event.preventDefault();
        commitInlineOption(bestInlineOption);
      }
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
  }, [activeOption, bestInlineOption, commitInlineOption, isAutoResolveInline, isError, isLoading, open, selectOption, visibleOptions]);

  const inputValue = isInline
    ? (query.length > 0 || open ? query : selectedOption?.label ?? '')
    : query;

  const renderResults = open ? (
    isAutoResolveInline ? null : (
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
              <span className="dc-city-search-option__body">
                <span className="dc-city-search-option__label">{option.label}</span>
                {option.meta ? <span className="dc-city-search-option__meta">{option.meta}</span> : null}
              </span>
            </button>
          );
        })
      )}
    </div>
    )
  ) : null;

  const renderInlineFeedback = isAutoResolveInline && open ? (
    stateMessage ? (
      <p id={stateId} className="dc-city-search-state dc-city-search-state--inline" role="status" aria-live="polite">
        {stateMessage}
      </p>
    ) : bestInlineOption ? (
      <button
        id={previewId}
        type="button"
        className="dc-city-search-preview"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => selectOption(bestInlineOption)}
      >
        <span className="dc-city-search-preview__icon" aria-hidden="true">
          <IconCheck />
        </span>
        <span className="dc-city-search-preview__body">
          <span className="dc-city-search-preview__label">{bestInlineOption.label}</span>
          {bestInlineOption.meta ? (
            <span className="dc-city-search-preview__meta">{bestInlineOption.meta}</span>
          ) : null}
        </span>
      </button>
    ) : null
  ) : null;

  if (isInline) {
    return (
      <div className={cn('dc-city-search', 'dc-city-search--inline', className)}>
        <div className="dc-city-search-input-wrap">
          <span className="requests-select-icon dc-city-search-input__icon" aria-hidden="true">
            <IconPin />
          </span>
          <Input
            ref={searchInputRef}
            type="search"
            value={inputValue}
            onFocus={() => {
              if (disabled) return;
              setOpen(true);
            }}
            onBlur={() => {
              window.setTimeout(() => {
                if (isAutoResolveInline && query.trim().length > 0 && bestInlineOption && !isLoading && !isError) {
                  commitInlineOption(bestInlineOption);
                  return;
                }
                setOpen(false);
                setQuery('');
                setActiveIndex(-1);
              }, isAutoResolveInline ? 0 : 120);
            }}
            onChange={(event) => {
              const nextQuery = event.target.value;
              setQuery(nextQuery);
              if (isAutoResolveInline && nextQuery.trim().length === 0) {
                onChange(allOption?.value ?? '');
              }
              if (!open) setOpen(true);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder={placeholder}
            aria-label={ariaLabel}
            role={isAutoResolveInline ? undefined : 'combobox'}
            aria-autocomplete={isAutoResolveInline ? undefined : 'list'}
            aria-expanded={isAutoResolveInline ? undefined : open}
            aria-controls={isAutoResolveInline ? undefined : listboxId}
            aria-activedescendant={isAutoResolveInline ? undefined : activeOptionId}
            aria-describedby={open ? (stateMessage ? stateId : bestInlineOption ? previewId : undefined) : undefined}
            className="dc-city-search-input"
            autoComplete="off"
            disabled={disabled}
          />
        </div>
        {renderInlineFeedback}
        {renderResults}
      </div>
    );
  }

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
          value={inputValue}
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
        {renderResults}
      </div>
    </Popover>
  );
}
