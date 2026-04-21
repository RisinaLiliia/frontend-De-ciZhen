// src/components/requests/details/RequestDetailAside.tsx
import type { ReactNode } from 'react';
import { IconCalendar, IconChat, IconPin } from '@/components/ui/icons/icons';
import { OfferActionButton } from '@/components/ui/OfferActionButton';

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
  onApply: () => void;
  onChat: () => void;
  applyDisabled?: boolean;
  applyState?: 'default' | 'done' | 'edit' | 'accepted';
  applyTitle?: string;
  applyHint?: string;
  showApply?: boolean;
  showChat?: boolean;
  notice?: ReactNode;
  extraActions?: ReactNode;
  metaContent?: ReactNode;
  metaClassName?: string;
  showMeta?: boolean;
  children?: ReactNode;
};

export function RequestDetailAside({
  cityLabel,
  dateLabel,
  ctaApplyLabel,
  ctaChatLabel,
  onApply,
  onChat,
  applyDisabled,
  applyState = 'default',
  applyTitle,
  applyHint,
  showApply = true,
  showChat = true,
  notice,
  extraActions,
  metaContent,
  metaClassName,
  showMeta = true,
  children,
}: RequestDetailAsideProps) {
  const isEditState = applyState === 'edit';
  const isAcceptedState = applyState === 'accepted';

  return (
    <aside className="panel request-detail__panel request-detail__aside">
      {showMeta ? (metaContent ?? <RequestDetailMetaRows cityLabel={cityLabel} dateLabel={dateLabel} className={metaClassName} />) : null}

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
      </div>
      <div className="request-detail__aside-spacer" />
      {children}
    </aside>
  );
}
