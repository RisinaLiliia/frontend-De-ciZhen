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
  compactIcons?: boolean;
  className?: string;
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
  compactIcons = false,
  className,
}: RequestDetailMobileCtaProps) {
  const isEditState = applyState === 'edit';
  const applyActionStateClass = isEditState ? 'request-card__status-action--edit' : 'request-card__status-action--submit';

  return (
    <div className={`request-detail__mobile-cta ${compactIcons ? 'request-detail__mobile-cta--compact' : ''} ${className ?? ''}`.trim()}>
      {notice ? <div className="request-detail__notice">{notice}</div> : null}
      <div className={compactIcons ? 'request-card__status-actions' : 'request-detail__cta'}>
        {extraActions}
        {showApply ? (
          compactIcons ? (
            <OfferActionButton
              kind={isEditState ? 'edit' : 'submit'}
              label={ctaApplyLabel}
              className={`request-card__status-action ${applyActionStateClass}`.trim()}
              onClick={onApply}
              disabled={applyDisabled}
              title={isEditState ? applyTitle : undefined}
              iconOnly
            />
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
        {showApply && applyHint && !compactIcons ? <p className="request-detail__cta-subtext">{applyHint}</p> : null}
        {showChat ? (
          compactIcons ? (
            <button
              type="button"
              className="btn-secondary offer-action-btn offer-action-btn--icon-only request-card__status-action request-card__status-action--chat"
              onClick={onChat}
              aria-label={ctaChatLabel}
              title={ctaChatLabel}
            >
              <i className="offer-action-btn__icon">
                <IconChat />
              </i>
            </button>
          ) : (
            <button
              type="button"
              className="btn-secondary request-detail__cta-btn"
              onClick={onChat}
              aria-label={ctaChatLabel}
            >
              <span>{ctaChatLabel}</span>
              <IconChat />
            </button>
          )
        ) : null}
        {showSave ? (
          compactIcons ? (
            <button
              type="button"
              className={`btn-secondary offer-action-btn offer-action-btn--icon-only request-card__status-action request-detail__save ${isSaved ? 'is-saved' : ''}`.trim()}
              onClick={onToggleSave}
              aria-label={ctaSaveLabel}
              title={ctaSaveLabel}
            >
              <i className="offer-action-btn__icon">
                <IconHeart className="icon-heart" />
              </i>
            </button>
          ) : (
            <button
              type="button"
              className={`btn-ghost is-primary request-detail__save ${isSaved ? 'is-saved' : ''}`.trim()}
              onClick={onToggleSave}
              aria-label={ctaSaveLabel}
            >
              <span>{ctaSaveLabel}</span>
              <IconHeart className="icon-heart" />
            </button>
          )
        ) : null}
      </div>
    </div>
  );
}
