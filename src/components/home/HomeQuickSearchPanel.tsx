import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { CategoryOption } from '@/types/home';

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
    <section className="panel stack-md">
      <div className="panel-header">
        <p className="section-title">{t(I18N_KEYS.homePublic.quickSearch)}</p>
      </div>
      <p className="stat-subtitle stat-location">
        <span className="radar-dot" aria-hidden="true" />
        {region ?? t(I18N_KEYS.homePublic.liveRegionFallback)}
      </p>
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
      <div className="flex gap-2 flex-wrap">
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
