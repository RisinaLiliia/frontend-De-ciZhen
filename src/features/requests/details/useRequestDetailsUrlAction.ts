import * as React from 'react';
import { toast } from 'sonner';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { RequestResponseDto } from '@/lib/api/dto/requests';

type Translate = (key: I18nKey) => string;

type RouterLike = {
  push: (href: string) => void;
  replace: (href: string) => void;
};

type SearchParamsLike = {
  get: (name: string) => string | null;
  toString: () => string;
} | null;

type UseRequestDetailsUrlActionParams = {
  authStatus: string;
  request: RequestResponseDto | null | undefined;
  isOwner: boolean;
  isOfferAccepted: boolean;
  isSaved: boolean;
  pathname: string;
  searchParams: SearchParamsLike;
  router: RouterLike;
  t: Translate;
  onOpenOfferForm: () => void;
  onToggleFavorite: (requestId: string) => void;
};

export function useRequestDetailsUrlAction({
  authStatus,
  request,
  isOwner,
  isOfferAccepted,
  isSaved,
  pathname,
  searchParams,
  router,
  t,
  onOpenOfferForm,
  onToggleFavorite,
}: UseRequestDetailsUrlActionParams) {
  const actionHandledRef = React.useRef(false);

  React.useEffect(() => {
    if (actionHandledRef.current) return;
    if (!request || authStatus !== 'authenticated') return;
    const action = searchParams?.get('action');
    if (!action) return;

    actionHandledRef.current = true;
    if (action === 'respond') {
      if (isOwner) {
        toast.message(t(I18N_KEYS.requestDetails.selfBidError));
      } else if (isOfferAccepted) {
        router.push('/workspace?tab=completed-jobs');
      } else {
        onOpenOfferForm();
      }
    } else if (action === 'chat') {
      if (isOwner) {
        toast.message(t(I18N_KEYS.requestDetails.ownerHint));
      } else {
        toast.message(t(I18N_KEYS.requestDetails.chatSoon));
      }
    } else if (action === 'favorite') {
      if (isOwner) {
        toast.message(t(I18N_KEYS.requestDetails.ownerHint));
      } else if (!isSaved) {
        onToggleFavorite(request.id);
      } else {
        toast.success(t(I18N_KEYS.requestDetails.saved));
      }
    }

    const nextParams = new URLSearchParams(searchParams?.toString());
    nextParams.delete('action');
    const nextQs = nextParams.toString();
    router.replace(`${pathname}${nextQs ? `?${nextQs}` : ''}`);
  }, [
    authStatus,
    isOfferAccepted,
    isOwner,
    isSaved,
    onOpenOfferForm,
    onToggleFavorite,
    pathname,
    request,
    router,
    searchParams,
    t,
  ]);
}

