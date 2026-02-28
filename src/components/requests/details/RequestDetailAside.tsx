// src/components/requests/details/RequestDetailAside.tsx
import type { ReactNode } from 'react';
import { IconCalendar, IconChat, IconPin } from '@/components/ui/icons/icons';
import { OfferActionButton } from '@/components/ui/OfferActionButton';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';

type RequestDetailMetaRowsProps = {
  cityLabel: string;
  dateLabel: string;
  className?: string;
};

export function RequestDetailMetaRows({ cityLabel, dateLabel, className }: RequestDetailMetaRowsProps) {
  return (
    <div className={`request-detail__meta ${className ?? ''}`.trim()}>
      <div className="request-detail__meta-item">
        <IconPin />
        <span>{cityLabel}</span>
      </div>
      <div className="request-detail__meta-item">
        <IconCalendar />
        <span>{dateLabel}</span>
      </div>
    </div>
  );
}

type RequestDetailAsideProps = {
  cityLabel: string;
  dateLabel: string;
  ctaApplyLabel: string;
  ctaChatLabel: string;
  ctaSaveLabel: string;
  isSaved: boolean;
  isSavePending?: boolean;
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
  metaContent?: ReactNode;
  metaClassName?: string;
  children?: ReactNode;
};

export function RequestDetailAside({
  cityLabel,
  dateLabel,
  ctaApplyLabel,
  ctaChatLabel,
  ctaSaveLabel,
  isSaved,
  isSavePending = false,
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
  metaContent,
  metaClassName,
  children,
}: RequestDetailAsideProps) {
  const isEditState = applyState === 'edit';
  const isAcceptedState = applyState === 'accepted';

  return (
    <aside className="panel request-detail__panel request-detail__aside">
      {metaContent ?? <RequestDetailMetaRows cityLabel={cityLabel} dateLabel={dateLabel} className={metaClassName} />}

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
          <FavoriteButton
            variant="cta"
            isFavorite={isSaved}
            isPending={isSavePending}
            ariaLabel={ctaSaveLabel}
            label={ctaSaveLabel}
            onToggle={onToggleSave}
          />
        ) : null}
      </div>
      <div className="request-detail__aside-spacer" />
      {children}
    </aside>
  );
}
