// src/components/requests/details/RequestDetailMobileCta.tsx
import { IconChat, IconHeart } from '@/components/ui/icons/icons';
import { OfferActionButton } from '@/components/ui/OfferActionButton';

type RequestDetailMobileCtaProps = {
  ctaApplyLabel: string;
  ctaChatLabel: string;
  ctaSaveLabel: string;
  isSaved: boolean;
  onApply: () => void;
  onChat: () => void;
  onToggleSave: () => void;
  applyDisabled?: boolean;
  applyState?: 'default' | 'done' | 'edit' | 'accepted';
  applyTitle?: string;
  applyHint?: string;
  showApply?: boolean;
  showChat?: boolean;
  showSave?: boolean;
  notice?: React.ReactNode;
  extraActions?: React.ReactNode;
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
  applyTitle,
  applyHint,
  showApply = true,
  showChat = true,
  showSave = true,
  notice,
  extraActions,
}: RequestDetailMobileCtaProps) {
  const isEditState = applyState === 'edit';
  const isAcceptedState = applyState === 'accepted';

  return (
    <div className="request-detail__mobile-cta">
      {notice ? <div className="request-detail__notice">{notice}</div> : null}
      <div className="request-detail__cta">
        {extraActions}
        {showApply ? (
          isAcceptedState ? (
            <button
              type="button"
              className="btn-secondary request-detail__cta-btn is-accepted"
              onClick={onApply}
              disabled={applyDisabled}
            >
              <span>{ctaApplyLabel}</span>
            </button>
          ) : (
            <OfferActionButton
              kind={isEditState ? 'edit' : 'submit'}
              label={ctaApplyLabel}
              className={`request-detail__cta-btn ${
                applyState === 'done' ? 'is-done' : ''
              } ${isEditState ? 'is-edit' : ''}`.trim()}
              onClick={onApply}
              disabled={applyDisabled}
              title={isEditState ? applyTitle : undefined}
            />
          )
        ) : null}
        {showApply && applyHint ? <p className="request-detail__cta-subtext">{applyHint}</p> : null}
        {showChat ? (
          <button
            type="button"
            className="btn-secondary request-detail__cta-btn"
            onClick={onChat}
          >
            <span>{ctaChatLabel}</span>
            <IconChat />
          </button>
        ) : null}
        {showSave ? (
          <button
            type="button"
            className={`btn-ghost is-primary ${isSaved ? 'is-saved' : ''}`}
            onClick={onToggleSave}
          >
            <span>{ctaSaveLabel}</span>
            <IconHeart className="icon-heart" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
