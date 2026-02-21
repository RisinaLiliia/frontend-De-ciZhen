import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
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
    const matched = cityOptions.find((city) => city.label.toLowerCase() === value.trim().toLowerCase());
    onCityResolvedChange(matched?.id ?? '');
  };

  const handleCitySelect = (id: string, label: string) => {
    onCityQueryChange(label);
    onCityResolvedChange(id);
    setShowCitySuggestions(false);
  };

  return (
    <section className="panel home-quick-search-panel">
      <div className="home-quick-search__panel-header home-quick-search__header">
        <p className="section-title home-quick-search__title">{t(I18N_KEYS.homePublic.quickSearch)}</p>
        <span className="request-meta-item home-quick-search__location">
          <IconPin />
          {region ?? t(I18N_KEYS.homePublic.liveRegionFallback)}
        </span>
      </div>
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
            aria-label={t(I18N_KEYS.home.cityPlaceholder)}
            placeholder={t(I18N_KEYS.home.cityPlaceholder)}
            value={cityQuery}
            onFocus={() => setShowCitySuggestions(true)}
            onBlur={() => {
              window.setTimeout(() => setShowCitySuggestions(false), 120);
            }}
            onChange={(event) => handleCityChange(event.target.value)}
          />
          {showCitySuggestions && citySuggestions.length > 0 ? (
            <div className="home-quick-search__city-suggestions" role="listbox" aria-label={t(I18N_KEYS.home.cityPlaceholder)}>
              {citySuggestions.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  className="home-quick-search__city-option"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleCitySelect(city.id, city.label)}
                >
                  {city.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <button type="button" className="btn-secondary home-quick-search__button" onClick={onSearch}>
          {t(I18N_KEYS.homePublic.searchCta)}
        </button>
      </div>
    </section>
  );
}
