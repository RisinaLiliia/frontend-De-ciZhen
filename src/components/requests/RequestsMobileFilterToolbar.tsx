import { IconButton } from '@/components/ui/IconButton';
import { IconFilter, IconSettings } from '@/components/ui/icons/icons';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';

type Props = {
  t: (key: I18nKey) => string;
  isOpen: boolean;
  disabled: boolean;
  page: number;
  totalPages: number;
  hasPagination: boolean;
  onToggleFilters: () => void;
  onOpenSort: () => void;
  onPrevPage?: () => void;
  onNextPage?: () => void;
};

export function RequestsMobileFilterToolbar({
  t,
  isOpen,
  disabled,
  page,
  totalPages,
  hasPagination,
  onToggleFilters,
  onOpenSort,
  onPrevPage,
  onNextPage,
}: Props) {
  return (
    <div className="requests-mobile-toolbar" role="group" aria-label={t(I18N_KEYS.requestsPage.mobileControlsLabel)}>
      <IconButton
        label={t(I18N_KEYS.requestsPage.mobileFilterLabel)}
        title={t(I18N_KEYS.requestsPage.mobileFilterLabel)}
        data-tooltip={t(I18N_KEYS.requestsPage.mobileFilterLabel)}
        className={`requests-mobile-toolbar__btn icon-button--hint ${isOpen ? 'is-active' : ''}`.trim()}
        onClick={onToggleFilters}
        aria-expanded={isOpen}
        aria-controls="requests-filter-controls"
        disabled={disabled}
      >
        <IconFilter />
      </IconButton>

      {hasPagination ? (
        <div className="requests-page-nav" role="group" aria-label={t(I18N_KEYS.requestsPage.paginationMobileLabel)}>
          <button
            type="button"
            className="btn-ghost requests-page-nav__btn"
            onClick={onPrevPage}
            disabled={disabled || page <= 1}
            aria-label={t(I18N_KEYS.requestsPage.paginationPrev)}
            title={t(I18N_KEYS.requestsPage.paginationPrev)}
          >
            ←
          </button>
          <span className="requests-page-nav__label">
            {page}/{Math.max(1, totalPages)}
          </span>
          <button
            type="button"
            className="btn-ghost requests-page-nav__btn"
            onClick={onNextPage}
            disabled={disabled || page >= totalPages}
            aria-label={t(I18N_KEYS.requestsPage.paginationNext)}
            title={t(I18N_KEYS.requestsPage.paginationNext)}
          >
            →
          </button>
        </div>
      ) : null}

      <IconButton
        label={t(I18N_KEYS.requestsPage.mobileSortLabel)}
        title={t(I18N_KEYS.requestsPage.mobileSortLabel)}
        data-tooltip={t(I18N_KEYS.requestsPage.mobileSortLabel)}
        className="requests-mobile-toolbar__btn icon-button--hint"
        onClick={onOpenSort}
        aria-controls="requests-filter-controls"
        disabled={disabled}
      >
        <IconSettings />
      </IconButton>
    </div>
  );
}
