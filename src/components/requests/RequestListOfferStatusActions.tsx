'use client';

import Link from 'next/link';

import { OfferActionButton } from '@/components/ui/OfferActionButton';
import { IconBriefcase, IconChat } from '@/components/ui/icons/icons';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { getStatusBadgeClass } from '@/lib/statusBadge';
import type { RequestListStatusActions, RequestListStatusPresentation } from './requestListStatus.types';

type RequestListOfferStatusActionsProps = {
  status: RequestListStatusPresentation;
  actions: Omit<RequestListStatusActions, 'ownerRequestActions'>;
};

export function RequestListOfferStatusActions({
  status,
  actions,
}: RequestListOfferStatusActionsProps) {
  const {
    t,
    onSendOffer,
    onEditOffer,
    onWithdrawOffer,
    onOpenChatThread,
  } = actions;
  const offerId = status.itemOffer?.id;
  const chatOffer = status.itemOffer;

  if (!status.badgeStatus && status.offerCardState === 'none') {
    if (!onSendOffer) return null;

    return (
      <span className="request-card__status-actions">
        <OfferActionButton
          kind="submit"
          label={t(I18N_KEYS.requestDetails.ctaApply)}
          ariaLabel={t(I18N_KEYS.requestDetails.ctaApply)}
          title={t(I18N_KEYS.requestDetails.ctaApply)}
          iconOnly
          className="request-card__status-action request-card__status-action--submit"
          onClick={() => onSendOffer(status.itemId)}
        />
      </span>
    );
  }

  if (!status.statusLabel || !status.badgeStatus) return null;

  return (
    <span className="request-card__status-actions">
      <span
        className={`${getStatusBadgeClass(status.badgeStatus)} capitalize`}
        title={
          status.badgeStatus === 'sent'
            ? t(I18N_KEYS.requestDetails.responseSentHint)
            : status.statusLabel
        }
      >
        {status.statusLabel}
      </span>
      {status.offerCardState === 'sent' ? (
        <>
          {onEditOffer ? (
            <OfferActionButton
              kind="edit"
              label={t(I18N_KEYS.requestDetails.responseEditCta)}
              ariaLabel={t(I18N_KEYS.requestDetails.responseEditTooltip)}
              title={t(I18N_KEYS.requestDetails.responseEditTooltip)}
              iconOnly
              className="request-card__status-action request-card__status-action--edit"
              onClick={() => onEditOffer(status.itemId)}
            />
          ) : null}
          {onWithdrawOffer && offerId ? (
            <OfferActionButton
              kind="delete"
              label={t(I18N_KEYS.requestDetails.responseCancel)}
              ariaLabel={t(I18N_KEYS.requestDetails.responseCancel)}
              title={t(I18N_KEYS.requestDetails.responseCancel)}
              iconOnly
              className="request-card__status-action request-card__status-action--danger"
              onClick={() => onWithdrawOffer(offerId)}
              disabled={status.isPendingWithdraw}
            />
          ) : null}
        </>
      ) : null}
      {status.offerCardState === 'accepted' ? (
        <>
          <Link
            href="/workspace?tab=completed-jobs"
            prefetch={false}
            className="btn-primary offer-action-btn offer-action-btn--icon-only request-card__status-action request-card__status-action--contract"
            aria-label={t(I18N_KEYS.requestDetails.responseViewContract)}
            title={t(I18N_KEYS.requestDetails.responseViewContract)}
          >
            <i className="offer-action-btn__icon">
              <IconBriefcase />
            </i>
          </Link>
          {chatOffer?.id ? (
            onOpenChatThread ? (
              <button
                type="button"
                className="btn-secondary offer-action-btn offer-action-btn--icon-only request-card__status-action request-card__status-action--chat"
                onClick={() => onOpenChatThread(chatOffer)}
                aria-label={t(I18N_KEYS.requestDetails.ctaChat)}
                title={t(I18N_KEYS.requestDetails.ctaChat)}
              >
                <i className="offer-action-btn__icon">
                  <IconChat />
                </i>
              </button>
            ) : (
              <Link
                href="/chat"
                prefetch={false}
                className="btn-secondary offer-action-btn offer-action-btn--icon-only request-card__status-action request-card__status-action--chat"
                aria-label={t(I18N_KEYS.requestDetails.ctaChat)}
                title={t(I18N_KEYS.requestDetails.ctaChat)}
              >
                <i className="offer-action-btn__icon">
                  <IconChat />
                </i>
              </Link>
            )
          ) : null}
        </>
      ) : null}
      {status.offerCardState === 'declined' && onSendOffer ? (
        <OfferActionButton
          kind="submit"
          label={t(I18N_KEYS.requestDetails.ctaApply)}
          ariaLabel={t(I18N_KEYS.requestDetails.ctaApply)}
          title={t(I18N_KEYS.requestDetails.ctaApply)}
          iconOnly
          className="request-card__status-action request-card__status-action--submit"
          onClick={() => onSendOffer(status.itemId)}
        />
      ) : null}
    </span>
  );
}
