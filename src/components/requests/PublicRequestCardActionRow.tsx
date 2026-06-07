'use client';

import Link from 'next/link';

import { DEFAULT_PRIVATE_WORKSPACE_REQUESTS_HREF } from '@/features/workspace/state';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { OfferDto } from '@/lib/api/dto/offers';
import type { I18nKey } from '@/lib/i18n/keys';
import type { PublicRequestCardStatusView } from '@/components/requests/publicRequestCard.model';

type Props = {
  status: PublicRequestCardStatusView;
  actions: {
    t: (key: I18nKey) => string;
    onSendOffer?: (requestId: string) => void;
    onEditOffer?: (requestId: string) => void;
    onWithdrawOffer?: (offerId: string, requestId?: string) => void;
    onOpenChatThread?: (offer: OfferDto) => void;
  };
};

function ActionButton({
  children,
  variant,
  onClick,
  disabled = false,
}: {
  children: string;
  variant: 'primary' | 'secondary';
  onClick: () => void;
  disabled?: boolean;
}) {
  const className = [
    variant === 'primary' ? 'btn-ghost is-primary' : 'btn-secondary',
    'my-request-card__action-btn',
    `my-request-card__action-btn--${variant}`,
  ].join(' ');

  return (
    <button type="button" className={className} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function ActionLink({
  children,
  href,
  variant,
}: {
  children: string;
  href: string;
  variant: 'primary' | 'secondary';
}) {
  const className = [
    variant === 'primary' ? 'btn-ghost is-primary' : 'btn-secondary',
    'my-request-card__action-btn',
    `my-request-card__action-btn--${variant}`,
  ].join(' ');

  return (
    <Link href={href} prefetch={false} className={className}>
      {children}
    </Link>
  );
}

export function PublicRequestCardActionRow({
  status,
  actions,
}: Props) {
  const {
    t,
    onSendOffer,
    onEditOffer,
    onWithdrawOffer,
    onOpenChatThread,
  } = actions;
  const offerId = status.itemOffer?.id;
  const chatOffer = status.itemOffer;

  if (status.offerCardState === 'none') {
    if (!onSendOffer) return null;

    return (
      <div className="workspace-guest-request-card__footer">
        <div className="workspace-guest-request-card__action-row">
          <ActionButton variant="primary" onClick={() => onSendOffer(status.itemId)}>
            {t(I18N_KEYS.requestDetails.ctaApply)}
          </ActionButton>
        </div>
      </div>
    );
  }

  if (status.offerCardState === 'declined') {
    if (!onSendOffer) return null;

    return (
      <div className="workspace-guest-request-card__footer">
        <div className="workspace-guest-request-card__action-row">
          <ActionButton variant="primary" onClick={() => onSendOffer(status.itemId)}>
            {t(I18N_KEYS.requestDetails.ctaApply)}
          </ActionButton>
        </div>
      </div>
    );
  }

  if (status.offerCardState === 'sent') {
    if (!onEditOffer && !(onWithdrawOffer && offerId)) return null;

    return (
      <div className="workspace-guest-request-card__footer">
        <div className="workspace-guest-request-card__action-row">
          {onWithdrawOffer && offerId ? (
            <ActionButton
              variant="secondary"
              onClick={() => onWithdrawOffer(offerId, status.itemId)}
              disabled={status.isPendingWithdraw}
            >
              {t(I18N_KEYS.requestDetails.responseCancel)}
            </ActionButton>
          ) : null}
          {onEditOffer ? (
            <ActionButton variant="primary" onClick={() => onEditOffer(status.itemId)}>
              {t(I18N_KEYS.requestDetails.responseEditCta)}
            </ActionButton>
          ) : null}
        </div>
      </div>
    );
  }

  if (status.offerCardState === 'accepted') {
    return (
      <div className="workspace-guest-request-card__footer">
        <div className="workspace-guest-request-card__action-row">
          {chatOffer?.id ? (
            onOpenChatThread ? (
              <ActionButton variant="secondary" onClick={() => onOpenChatThread(chatOffer)}>
                {t(I18N_KEYS.requestDetails.ctaChat)}
              </ActionButton>
            ) : (
              <ActionLink href="/chat" variant="secondary">
                {t(I18N_KEYS.requestDetails.ctaChat)}
              </ActionLink>
            )
          ) : null}
          <ActionLink href={DEFAULT_PRIVATE_WORKSPACE_REQUESTS_HREF} variant="primary">
            {t(I18N_KEYS.requestDetails.responseViewContract)}
          </ActionLink>
        </div>
      </div>
    );
  }

  return null;
}
