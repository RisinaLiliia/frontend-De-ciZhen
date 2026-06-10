import type { ReactNode } from 'react';

type DetailActionBarProps = {
  advice: string;
  actions: ReactNode;
  className?: string;
};

export function DetailActionBar({ advice, actions, className }: DetailActionBarProps) {
  return (
    <div className={`request-detail__action-bar ${className ?? ''}`.trim()}>
      <div className="request-detail__action-note" role="note">
        <span className="request-detail__action-note-icon" aria-hidden="true">
          i
        </span>
        <p className="request-detail__action-note-copy">{advice}</p>
      </div>

      <div className="request-detail__action-buttons">{actions}</div>
    </div>
  );
}
