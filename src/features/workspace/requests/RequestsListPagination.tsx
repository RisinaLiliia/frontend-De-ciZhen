import { RequestsPageNav } from '@/components/requests/RequestsPageNav';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import { t as translate, type Locale } from '@/lib/i18n/t';

function tx(locale: Locale, key: I18nKey) {
  return translate(key, locale);
}

export function RequestsListPagination({
  locale,
  page,
  totalPages,
  onPageChange,
}: {
  locale: Locale;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const safeTotalPages = Math.max(1, totalPages);
  const safePage = Math.min(safeTotalPages, Math.max(1, page));

  return (
    <div className="requests-pagination">
      <RequestsPageNav
        page={safePage}
        totalPages={safeTotalPages}
        onPrevPage={() => onPageChange(Math.max(1, safePage - 1))}
        onNextPage={() => onPageChange(Math.min(safeTotalPages, safePage + 1))}
        ariaLabel={tx(locale, I18N_KEYS.requestsPage.workspaceRequestPageNavigationLabel)}
        prevAriaLabel={tx(locale, I18N_KEYS.requestsPage.paginationPrev)}
        nextAriaLabel={tx(locale, I18N_KEYS.requestsPage.paginationNext)}
        prevTitle={tx(locale, I18N_KEYS.requestsPage.paginationPrev)}
        nextTitle={tx(locale, I18N_KEYS.requestsPage.paginationNext)}
      />
    </div>
  );
}
