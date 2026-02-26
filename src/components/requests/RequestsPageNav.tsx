type RequestsPageNavProps = {
  page: number;
  totalPages: number;
  disabled?: boolean;
  ariaLabel: string;
  prevAriaLabel: string;
  nextAriaLabel: string;
  prevTitle?: string;
  nextTitle?: string;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  className?: string;
};

export function RequestsPageNav({
  page,
  totalPages,
  disabled = false,
  ariaLabel,
  prevAriaLabel,
  nextAriaLabel,
  prevTitle,
  nextTitle,
  onPrevPage,
  onNextPage,
  className,
}: RequestsPageNavProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const safePage = Math.min(safeTotalPages, Math.max(1, page));

  return (
    <div className={`requests-page-nav ${className ?? ''}`.trim()} role="group" aria-label={ariaLabel}>
      <button
        type="button"
        className="btn-ghost requests-page-nav__btn"
        onClick={onPrevPage}
        disabled={disabled || safePage <= 1}
        aria-label={prevAriaLabel}
        title={prevTitle}
      >
        ←
      </button>
      <span className="requests-page-nav__label">
        {safePage}/{safeTotalPages}
      </span>
      <button
        type="button"
        className="btn-ghost requests-page-nav__btn"
        onClick={onNextPage}
        disabled={disabled || safePage >= safeTotalPages}
        aria-label={nextAriaLabel}
        title={nextTitle}
      >
        →
      </button>
    </div>
  );
}
