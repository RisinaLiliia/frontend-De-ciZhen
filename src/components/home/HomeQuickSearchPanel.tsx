import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import { IconPin } from '@/components/ui/icons/icons';

type HomeQuickSearchPanelProps = {
  t: (key: I18nKey) => string;
  region: string | null;
  query: string;
  cityQuery: string;
  selectedCategory: string;
  onQueryChange: (value: string) => void;
  onCityQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSearch: () => void;
};

export function HomeQuickSearchPanel({
  t,
  region,
  query,
  cityQuery,
  selectedCategory,
  onQueryChange,
  onCityQueryChange,
  onCategoryChange,
  onSearch,
}: HomeQuickSearchPanelProps) {
  const categoryChips = [
    { key: 'cleaning', label: t(I18N_KEYS.homePublic.serviceCleaning) },
    { key: 'electric', label: t(I18N_KEYS.homePublic.serviceElectric) },
    { key: 'plumbing', label: t(I18N_KEYS.homePublic.servicePlumbing) },
    { key: 'repair', label: t(I18N_KEYS.homePublic.serviceRepair) },
    { key: 'moving', label: t(I18N_KEYS.homePublic.serviceMoving) },
  ];

  return (
    <section className="panel home-quick-search-panel">
      <div className="panel-header home-quick-search__header">
        <p className="section-title">{t(I18N_KEYS.homePublic.quickSearch)}</p>
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
              onClick={() => onCategoryChange(isActive ? '' : item.key)}
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
        <input
          className="field home-quick-search__field"
          type="search"
          aria-label={t(I18N_KEYS.home.cityPlaceholder)}
          placeholder={t(I18N_KEYS.home.cityPlaceholder)}
          value={cityQuery}
          onChange={(event) => onCityQueryChange(event.target.value)}
        />
        <button type="button" className="btn-secondary home-quick-search__button" onClick={onSearch}>
          {t(I18N_KEYS.homePublic.searchCta)}
        </button>
      </div>
    </section>
  );
}
