/* src/components/home/HomeQuickSearchPanel.tsx */
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { IconPin } from '@/components/ui/icons/icons';
import { useCities } from '@/features/catalog/queries';
import { pickI18n } from '@/lib/i18n/helpers';
import type { Locale } from '@/lib/i18n/t';
import * as React from 'react';

type HomeQuickSearchPanelProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  region: string | null;
  query: string;
  cityQuery: string;
  selectedCategory: string;
  onQueryChange: (value: string) => void;
  onCityQueryChange: (value: string) => void;
  onCityResolvedChange: (cityId: string) => void;
  onCategoryChange: (value: string) => void;
  onSearch: () => void;
};

export function HomeQuickSearchPanel({
  t,
  locale,
  region,
  query,
  cityQuery,
  selectedCategory,
  onQueryChange,
  onCityQueryChange,
  onCityResolvedChange,
  onCategoryChange,
  onSearch,
}: HomeQuickSearchPanelProps) {
  const { data: cities = [] } = useCities('DE');
  const [showCitySuggestions, setShowCitySuggestions] = React.useState(false);
  const [activeCityIndex, setActiveCityIndex] = React.useState(-1);
  const cityListboxId = React.useId();
  const cityOptions = cities
    .map((city) => ({
      id: city.id,
      label: pickI18n(city.i18n, locale),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, locale));

  const normalizedCityQuery = cityQuery.trim().toLowerCase();
  const citySuggestions = normalizedCityQuery
    ? cityOptions.filter((city) => city.label.toLowerCase().startsWith(normalizedCityQuery)).slice(0, 8)
    : [];
  const hasCitySuggestions = showCitySuggestions && citySuggestions.length > 0;

  const categoryChips = [
    { key: 'cleaning', label: t(I18N_KEYS.homePublic.serviceCleaning) },
    { key: 'electric', label: t(I18N_KEYS.homePublic.serviceElectric) },
    { key: 'plumbing', label: t(I18N_KEYS.homePublic.servicePlumbing) },
    { key: 'repair', label: t(I18N_KEYS.homePublic.serviceRepair) },
    { key: 'moving', label: t(I18N_KEYS.homePublic.serviceMoving) },
  ];

  const handleChipClick = (key: string, label: string) => {
    const isActive = selectedCategory === key;
    if (isActive) {
      onCategoryChange('');
      if (query === label) {
        onQueryChange('');
      }
      return;
    }

    onCategoryChange(key);
    onQueryChange(label);
  };

  const handleCityChange = (value: string) => {
    onCityQueryChange(value);
    setShowCitySuggestions(true);
    setActiveCityIndex(-1);
    const matched = cityOptions.find((city) => city.label.toLowerCase() === value.trim().toLowerCase());
    onCityResolvedChange(matched?.id ?? '');
  };

  const handleCitySelect = (id: string, label: string) => {
    onCityQueryChange(label);
    onCityResolvedChange(id);
    setShowCitySuggestions(false);
    setActiveCityIndex(-1);
  };

  const handleCityKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!citySuggestions.length) {
      if (event.key === 'Escape') {
        setShowCitySuggestions(false);
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setShowCitySuggestions(true);
      setActiveCityIndex((prev) => (prev + 1) % citySuggestions.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setShowCitySuggestions(true);
      setActiveCityIndex((prev) => (prev <= 0 ? citySuggestions.length - 1 : prev - 1));
      return;
    }

    if (event.key === 'Enter' && activeCityIndex >= 0) {
      event.preventDefault();
      const picked = citySuggestions[activeCityIndex];
      if (picked) handleCitySelect(picked.id, picked.label);
      return;
    }

    if (event.key === 'Escape') {
      setShowCitySuggestions(false);
      setActiveCityIndex(-1);
    }
  };

  return (
    <Card className="home-quick-search-panel">
      <CardHeader className="home-quick-search__panel-header home-quick-search__header">
        <CardTitle className="home-quick-search__title">{t(I18N_KEYS.homePublic.quickSearch)}</CardTitle>
        <span className="request-meta-item home-quick-search__location">
          <IconPin />
          {region ?? t(I18N_KEYS.homePublic.liveRegionFallback)}
        </span>
      </CardHeader>
      <div className="chip-row home-quick-search__chips" role="group" aria-label={t(I18N_KEYS.homePublic.quickSearch)}>
        {categoryChips.map((item) => {
          const isActive = selectedCategory === item.key;
          return (
            <button
              key={item.key}
              type="button"
              className={`chip ${isActive ? 'is-active' : ''}`.trim()}
              onClick={() => handleChipClick(item.key, item.label)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="home-quick-search__actions">
        <input
          className="field home-quick-search__field"
          type="search"
          aria-label={t(I18N_KEYS.homePublic.searchPlaceholder)}
          placeholder={t(I18N_KEYS.homePublic.searchPlaceholder)}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <div className="home-quick-search__city-wrap">
          <input
            className="field home-quick-search__field"
            type="search"
            role="combobox"
            autoComplete="off"
            aria-label={t(I18N_KEYS.home.cityPlaceholder)}
            aria-expanded={hasCitySuggestions}
            aria-controls={hasCitySuggestions ? cityListboxId : undefined}
            aria-activedescendant={
              hasCitySuggestions && activeCityIndex >= 0 ? `${cityListboxId}-option-${activeCityIndex}` : undefined
            }
            placeholder={t(I18N_KEYS.home.cityPlaceholder)}
            value={cityQuery}
            onFocus={() => {
              setShowCitySuggestions(true);
              setActiveCityIndex(-1);
            }}
            onBlur={() => {
              window.setTimeout(() => {
                setShowCitySuggestions(false);
                setActiveCityIndex(-1);
              }, 120);
            }}
            onChange={(event) => handleCityChange(event.target.value)}
            onKeyDown={handleCityKeyDown}
          />
          {hasCitySuggestions ? (
            <div id={cityListboxId} className="home-quick-search__city-suggestions" role="listbox" aria-label={t(I18N_KEYS.home.cityPlaceholder)}>
              {citySuggestions.map((city, index) => (
                <button
                  key={city.id}
                  id={`${cityListboxId}-option-${index}`}
                  type="button"
                  className="home-quick-search__city-option"
                  role="option"
                  aria-selected={index === activeCityIndex}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveCityIndex(index)}
                  onClick={() => handleCitySelect(city.id, city.label)}
                >
                  {city.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <Button type="button" variant="secondary" fullWidth={false} className="home-quick-search__button" onClick={onSearch}>
          {t(I18N_KEYS.homePublic.searchCta)}
        </Button>
      </div>
    </Card>
  );
}
