'use client';

import Link from 'next/link';

import { OfferActionButton } from '@/components/ui/OfferActionButton';
import { IconBriefcase, IconEdit } from '@/components/ui/icons/icons';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { getStatusBadgeClass } from '@/lib/statusBadge';
import type { RequestListStatusActions, RequestListStatusPresentation } from './requestListStatus.types';

type RequestListOwnerStatusActionsProps = {
  status: RequestListStatusPresentation;
  actions: Pick<RequestListStatusActions, 't' | 'ownerRequestActions'>;
};

export function RequestListOwnerStatusActions({
  status,
  actions,
}: RequestListOwnerStatusActionsProps) {
  const { t, ownerRequestActions } = actions;

  return (
    <span className="request-card__status-actions">
      <span
        className={`${getStatusBadgeClass(status.itemStatus)} capitalize`}
        title={status.ownerStatusLabel}
      >
        {status.ownerStatusLabel}
      </span>
      <Link
        href={status.detailsHref}
        prefetch={false}
        className="btn-secondary offer-action-btn offer-action-btn--icon-only request-card__status-action"
        aria-label={t(I18N_KEYS.requestsPage.openRequest)}
        title={t(I18N_KEYS.requestsPage.openRequest)}
      >
        <i className="offer-action-btn__icon">
          <IconBriefcase />
        </i>
      </Link>
      <Link
        href={`${status.detailsHref}?edit=1`}
        prefetch={false}
        className="btn-secondary offer-action-btn offer-action-btn--icon-only request-card__status-action request-card__status-action--edit"
        aria-label={t(I18N_KEYS.requestDetails.responseEditTooltip)}
        title={t(I18N_KEYS.requestDetails.responseEditTooltip)}
      >
        <i className="offer-action-btn__icon">
          <IconEdit />
        </i>
      </Link>
      <OfferActionButton
        kind="delete"
        label={t(I18N_KEYS.requestDetails.responseCancel)}
        ariaLabel={t(I18N_KEYS.requestDetails.responseCancel)}
        title={t(I18N_KEYS.requestDetails.responseCancel)}
        iconOnly
        className="request-card__status-action request-card__status-action--danger"
        onClick={() => ownerRequestActions?.onDelete?.(status.itemId)}
        disabled={status.isPendingOwnerDelete}
      />
    </span>
  );
}
