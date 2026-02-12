// src/components/requests/details/RequestDetailMobileCta.tsx
import { IconCheck, IconChat, IconHeart } from '@/components/ui/icons/icons';

type RequestDetailMobileCtaProps = {
  ctaApplyLabel: string;
  ctaChatLabel: string;
  ctaSaveLabel: string;
  isSaved: boolean;
  onApply: () => void;
  onChat: () => void;
  onToggleSave: () => void;
  applyDisabled?: boolean;
  applyState?: 'default' | 'done';
};

export function RequestDetailMobileCta({
  ctaApplyLabel,
  ctaChatLabel,
  ctaSaveLabel,
  isSaved,
  onApply,
  onChat,
  onToggleSave,
  applyDisabled,
  applyState = 'default',
}: RequestDetailMobileCtaProps) {
  return (
    <div className="request-detail__mobile-cta">
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
        className={`btn-ghost is-primary ${isSaved ? 'is-saved' : ''}`}
        onClick={onToggleSave}
      >
        <span>{ctaSaveLabel}</span>
        <IconHeart className="icon-heart" />
      </button>
    </div>
  );
}
