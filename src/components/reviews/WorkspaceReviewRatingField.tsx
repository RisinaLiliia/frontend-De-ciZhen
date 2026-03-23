'use client';

type WorkspaceReviewRatingFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

export function WorkspaceReviewRatingField({
  label,
  value,
  onChange,
}: WorkspaceReviewRatingFieldProps) {
  return (
    <div className="form-group">
      <p className="typo-small">{label}</p>
      <div className="provider-reviews-hub__star-line">
        <div
          className="chip-row provider-reviews-hub__star-picker"
          role="group"
          aria-label={label}
        >
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              type="button"
              className={`icon-button icon-button--md provider-reviews-hub__star-btn ${score <= value ? '' : 'typo-muted'}`.trim()}
              aria-pressed={value === score}
              onClick={() => onChange(score)}
              aria-label={`${score}`}
            >
              {score <= value ? '★' : '☆'}
            </button>
          ))}
        </div>
        <span className="typo-body provider-reviews-hub__star-value" aria-live="polite">
          {value.toFixed(1)}
        </span>
      </div>
    </div>
  );
}
