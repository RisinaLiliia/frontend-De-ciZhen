'use client';

import { RequestListOfferStatusActions } from '@/components/requests/RequestListOfferStatusActions';
import { RequestListOwnerStatusActions } from '@/components/requests/RequestListOwnerStatusActions';
import type { RequestListStatusActions, RequestListStatusPresentation } from './requestListStatus.types';

type RequestListStatusSlotProps = {
  status: RequestListStatusPresentation;
  actions: RequestListStatusActions;
};

export function RequestListStatusSlot({
  status,
  actions,
}: RequestListStatusSlotProps) {
  if (status.isOwnerRequestList) {
    return <RequestListOwnerStatusActions status={status} actions={actions} />;
  }

  return <RequestListOfferStatusActions status={status} actions={actions} />;
}
