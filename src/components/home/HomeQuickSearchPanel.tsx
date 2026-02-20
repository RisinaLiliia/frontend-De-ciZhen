import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { CategoryOption } from '@/types/home';
import { IconPin } from '@/components/ui/icons/icons';

type HomeQuickSearchPanelProps = {
  t: (key: I18nKey) => string;
  region: string | null;
  categories: CategoryOption[];
  selectedCategory: string | null;
  query: string;
  onSelectCategory: (key: string) => void;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
};

export function HomeQuickSearchPanel({
  t,
  region,
  categories,
  selectedCategory,
  query,
  onSelectCategory,
  onQueryChange,
  onSearch,
}: HomeQuickSearchPanelProps) {
  return (
    <section className="panel stack-md home-quick-search-panel">
      <div className="panel-header home-quick-search__header">
        <p className="section-title">{t(I18N_KEYS.homePublic.quickSearch)}</p>
        <span className="request-meta-item home-quick-search__location">
          <IconPin />
          {region ?? t(I18N_KEYS.homePublic.liveRegionFallback)}
        </span>
      </div>
      <div className="chip-row">
        {categories.map((cat) => (
          <button
            key={cat.key}
            type="button"
            className={`chip ${selectedCategory === cat.key ? 'is-active' : ''}`}
            onClick={() => onSelectCategory(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap home-quick-search__actions ">
        <input
          className="field flex-1 min-w-45"
          type="search"
          aria-label={t(I18N_KEYS.homePublic.searchPlaceholder)}
          placeholder={t(I18N_KEYS.homePublic.searchPlaceholder)}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <button type="button" className="btn-secondary w-auto px-6" onClick={onSearch}>
          {t(I18N_KEYS.homePublic.searchCta)}
        </button>
      </div>

    </section>
  );
}
