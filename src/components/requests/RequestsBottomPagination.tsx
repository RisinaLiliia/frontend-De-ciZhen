'use client';

import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';

type RequestsBottomPaginationProps = {
  t: (key: I18nKey) => string;
  page: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
};

export function RequestsBottomPagination({
  t,
  page,
  totalPages,
  onPrevPage,
  onNextPage,
}: RequestsBottomPaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const safePage = Math.min(safeTotalPages, Math.max(1, page));

  return (
    <div className="requests-pagination">
      <span className="requests-page-nav__label">
        {safePage}/{safeTotalPages}
      </span>
      <div className="requests-page-nav" role="group" aria-label={t(I18N_KEYS.requestsPage.paginationBottomLabel)}>
        <button
          type="button"
          className="btn-ghost requests-page-nav__btn"
          onClick={onPrevPage}
          disabled={safePage <= 1}
          aria-label={t(I18N_KEYS.requestsPage.paginationPrev)}
        >
          ←
        </button>
        <button
          type="button"
          className="btn-ghost requests-page-nav__btn"
          onClick={onNextPage}
          disabled={safePage >= safeTotalPages}
          aria-label={t(I18N_KEYS.requestsPage.paginationNext)}
        >
          →
        </button>
      </div>
    </div>
  );
}
