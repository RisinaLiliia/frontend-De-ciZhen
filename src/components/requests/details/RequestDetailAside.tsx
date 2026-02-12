// src/components/requests/details/RequestDetailAside.tsx
import type { ReactNode } from 'react';
import { IconCalendar, IconCheck, IconChat, IconHeart, IconPin } from '@/components/ui/icons/icons';

type RequestDetailAsideProps = {
  cityLabel: string;
  dateLabel: string;
  ctaApplyLabel: string;
  ctaChatLabel: string;
  ctaSaveLabel: string;
  isSaved: boolean;
  onApply: () => void;
  onChat: () => void;
  onToggleSave: () => void;
  applyDisabled?: boolean;
  applyState?: 'default' | 'done';
  children?: ReactNode;
};

export function RequestDetailAside({
  cityLabel,
  dateLabel,
  ctaApplyLabel,
  ctaChatLabel,
  ctaSaveLabel,
  isSaved,
  onApply,
  onChat,
  onToggleSave,
  applyDisabled,
  applyState = 'default',
  children,
}: RequestDetailAsideProps) {
  return (
    <aside className="panel request-detail__panel request-detail__aside">
      <div className="request-detail__meta">
        <div className="request-detail__meta-item">
          <IconPin />
          <span>{cityLabel}</span>
        </div>
        <div className="request-detail__meta-item">
          <IconCalendar />
          <span>{dateLabel}</span>
        </div>
      </div>

      <div className="request-detail__cta">
        <button
          type="button"
          className={`btn-primary request-detail__cta-btn ${
            applyState === 'done' ? 'is-done' : ''
          }`.trim()}
          onClick={onApply}
          disabled={applyDisabled}
        >
          <span>{ctaApplyLabel}</span>
          <IconCheck />
        </button>
        <button
          type="button"
          className="btn-secondary request-detail__cta-btn"
          onClick={onChat}
        >
          <span>{ctaChatLabel}</span>
          <IconChat />
        </button>
        <button
          type="button"
          className={`btn-ghost is-primary request-detail__save ${isSaved ? 'is-saved' : ''}`}
          onClick={onToggleSave}
        >
          <span>{ctaSaveLabel}</span>
          <IconHeart className="icon-heart" />
        </button>
      </div>
      <div className="request-detail__aside-spacer" />
      {children}
    </aside>
  );
}
