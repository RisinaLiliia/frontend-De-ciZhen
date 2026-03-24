'use client';

import { RequestsPageNav } from '@/components/requests/RequestsPageNav';
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
      <RequestsPageNav
        page={safePage}
        totalPages={safeTotalPages}
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
        ariaLabel={t(I18N_KEYS.requestsPage.paginationBottomLabel)}
        prevAriaLabel={t(I18N_KEYS.requestsPage.paginationPrev)}
        nextAriaLabel={t(I18N_KEYS.requestsPage.paginationNext)}
        prevTitle={t(I18N_KEYS.requestsPage.paginationPrev)}
        nextTitle={t(I18N_KEYS.requestsPage.paginationNext)}
      />
    </div>
  );
}
