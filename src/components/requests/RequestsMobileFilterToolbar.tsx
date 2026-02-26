import { IconButton } from '@/components/ui/IconButton';
import { IconFilter, IconSettings } from '@/components/ui/icons/icons';
import { RequestsPageNav } from '@/components/requests/RequestsPageNav';
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
        <RequestsPageNav
          page={page}
          totalPages={totalPages}
          disabled={disabled}
          onPrevPage={onPrevPage}
          onNextPage={onNextPage}
          ariaLabel={t(I18N_KEYS.requestsPage.paginationMobileLabel)}
          prevAriaLabel={t(I18N_KEYS.requestsPage.paginationPrev)}
          nextAriaLabel={t(I18N_KEYS.requestsPage.paginationNext)}
          prevTitle={t(I18N_KEYS.requestsPage.paginationPrev)}
          nextTitle={t(I18N_KEYS.requestsPage.paginationNext)}
        />
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
