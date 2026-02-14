// src/components/requests/details/RequestDetailAside.tsx
import type { ReactNode } from 'react';
import { IconCalendar, IconChat, IconHeart, IconPin } from '@/components/ui/icons/icons';
import { OfferActionButton } from '@/components/ui/OfferActionButton';

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
  applyState?: 'default' | 'done' | 'edit' | 'accepted';
  applyTitle?: string;
  applyHint?: string;
  showApply?: boolean;
  showChat?: boolean;
  showSave?: boolean;
  notice?: ReactNode;
  extraActions?: ReactNode;
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
  applyTitle,
  applyHint,
  showApply = true,
  showChat = true,
  showSave = true,
  notice,
  extraActions,
  children,
}: RequestDetailAsideProps) {
  const isEditState = applyState === 'edit';
  const isAcceptedState = applyState === 'accepted';

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
            className={`btn-ghost is-primary request-detail__save ${isSaved ? 'is-saved' : ''}`}
            onClick={onToggleSave}
          >
            <span>{ctaSaveLabel}</span>
            <IconHeart className="icon-heart" />
          </button>
        ) : null}
      </div>
      <div className="request-detail__aside-spacer" />
      {children}
    </aside>
  );
}
