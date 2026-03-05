import * as React from 'react';
import type { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createOffer, deleteOffer, updateOffer } from '@/lib/api/offers';
import { ApiError } from '@/lib/api/http-error';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import { providerQK } from '@/features/provider/queries';
import type { OfferDto } from '@/lib/api/dto/offers';
import type { RequestResponseDto } from '@/lib/api/dto/requests';

type Translate = (key: I18nKey) => string;

type RouterLike = {
  push: (href: string) => void;
  replace: (href: string) => void;
};

type SearchParamsLike = {
  toString: () => string;
  get: (name: string) => string | null;
} | null;

type UseRequestOfferActionsParams = {
  authStatus: string;
  request: RequestResponseDto | null | undefined;
  existingResponse: OfferDto | null;
  isOwner: boolean;
  isOfferAccepted: boolean;
  pathname: string;
  searchParams: SearchParamsLike;
  router: RouterLike;
  qc: QueryClient;
  t: Translate;
  workspacePublicRequestsUrl: string;
  workspaceGuestRequestsUrl: string;
};

function resetOfferDraft(
  setOfferAmount: React.Dispatch<React.SetStateAction<string>>,
  setOfferComment: React.Dispatch<React.SetStateAction<string>>,
  setOfferAvailability: React.Dispatch<React.SetStateAction<string>>,
  setSubmittedOfferAmount: React.Dispatch<React.SetStateAction<number | null>>,
  setOfferSheetMode: React.Dispatch<React.SetStateAction<'form' | 'success'>>,
) {
  setOfferSheetMode('form');
  setSubmittedOfferAmount(null);
  setOfferAmount('');
  setOfferComment('');
  setOfferAvailability('');
}

export function useRequestOfferActions({
  authStatus,
  request,
  existingResponse,
  isOwner,
  isOfferAccepted,
  pathname,
  searchParams,
  router,
  qc,
  t,
  workspacePublicRequestsUrl,
  workspaceGuestRequestsUrl,
}: UseRequestOfferActionsParams) {
  const [offerAmount, setOfferAmount] = React.useState('');
  const [offerComment, setOfferComment] = React.useState('');
  const [offerAvailability, setOfferAvailability] = React.useState('');
  const [offerSheetMode, setOfferSheetMode] = React.useState<'form' | 'success'>('form');
  const [isSubmittingOffer, setIsSubmittingOffer] = React.useState(false);
  const [submittedOfferAmount, setSubmittedOfferAmount] = React.useState<number | null>(null);

  const isAuthed = authStatus === 'authenticated';
  const hasOffer = isAuthed && Boolean(existingResponse || submittedOfferAmount !== null);
  const isOfferSheetOpen = searchParams?.get('offer') === '1';

  React.useEffect(() => {
    if (isAuthed) return;
    resetOfferDraft(
      setOfferAmount,
      setOfferComment,
      setOfferAvailability,
      setSubmittedOfferAmount,
      setOfferSheetMode,
    );
  }, [isAuthed]);

  const setOfferSheetInUrl = React.useCallback(
    (open: boolean) => {
      const nextParams = new URLSearchParams(searchParams?.toString());
      if (open) {
        nextParams.set('offer', '1');
      } else {
        nextParams.delete('offer');
      }
      const qs = nextParams.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ''}`);
    },
    [pathname, router, searchParams],
  );

  const requireAuth = React.useCallback(() => {
    router.push('/auth/login');
    toast.message(t(I18N_KEYS.requestDetails.loginRequired));
  }, [router, t]);

  const openOfferForm = React.useCallback(() => {
    if (existingResponse) {
      setOfferAmount(
        typeof existingResponse.amount === 'number'
          ? String(Math.max(1, Math.round(existingResponse.amount)))
          : '',
      );
      setOfferComment(existingResponse.message ?? '');
      setOfferAvailability(existingResponse.availabilityNote ?? existingResponse.availableAt ?? '');
    } else {
      if (!offerAmount && request?.price) {
        setOfferAmount(String(Math.max(1, Math.round(request.price))));
      }
      setOfferComment('');
      setOfferAvailability('');
    }
    setOfferSheetMode('form');
    setOfferSheetInUrl(true);
  }, [existingResponse, offerAmount, request?.price, setOfferSheetInUrl]);

  const closeOfferSheet = React.useCallback(() => {
    setOfferSheetMode('form');
    setOfferSheetInUrl(false);
  }, [setOfferSheetInUrl]);

  const handleApply = React.useCallback(() => {
    if (!request) return;
    if (authStatus !== 'authenticated') {
      requireAuth();
      return;
    }
    if (isOwner) {
      toast.message(t(I18N_KEYS.requestDetails.selfBidError));
      return;
    }
    if (isOfferAccepted) {
      router.push('/workspace?tab=completed-jobs');
      return;
    }
    openOfferForm();
  }, [authStatus, isOfferAccepted, isOwner, openOfferForm, request, requireAuth, router, t]);

  const handleOfferSubmit = React.useCallback(async () => {
    if (!request || authStatus !== 'authenticated') return;
    const parsedAmount = Number(offerAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.message(t(I18N_KEYS.requestDetails.responseAmountInvalid));
      return;
    }

    setIsSubmittingOffer(true);
    try {
      const payload = {
        amount: parsedAmount,
        message: offerComment.trim() || undefined,
        availabilityNote: offerAvailability.trim() || undefined,
      };
      const response =
        existingResponse?.id
          ? await updateOffer(existingResponse.id, payload)
          : await createOffer({
              requestId: request.id,
              ...payload,
            });
      setSubmittedOfferAmount(response.offer.amount ?? parsedAmount);
      if (existingResponse?.id) {
        setOfferSheetInUrl(false);
        toast.success(t(I18N_KEYS.requestDetails.responseUpdated));
      } else {
        setOfferSheetMode('success');
      }
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['offers-my'] }),
        qc.invalidateQueries({ queryKey: providerQK.myProfile() }),
      ]);
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
        toast.message(t(I18N_KEYS.requestDetails.responseEditUnavailable));
      } else if (error instanceof ApiError && error.status === 409) {
        setSubmittedOfferAmount(parsedAmount);
        setOfferSheetInUrl(false);
        toast.message(t(I18N_KEYS.requestDetails.responseAlready));
      } else if (error instanceof ApiError && error.status === 403) {
        toast.error(error.message || t(I18N_KEYS.requestDetails.responseFailed));
      } else {
        toast.error(t(I18N_KEYS.requestDetails.responseFailed));
      }
    } finally {
      setIsSubmittingOffer(false);
    }
  }, [
    authStatus,
    existingResponse?.id,
    offerAmount,
    offerAvailability,
    offerComment,
    qc,
    request,
    setOfferSheetInUrl,
    t,
  ]);

  const handleOfferCancel = React.useCallback(async () => {
    if (isSubmittingOffer) return;

    if (!existingResponse?.id) {
      resetOfferDraft(
        setOfferAmount,
        setOfferComment,
        setOfferAvailability,
        setSubmittedOfferAmount,
        setOfferSheetMode,
      );
      setOfferSheetInUrl(false);
      router.push(authStatus === 'authenticated' ? workspacePublicRequestsUrl : workspaceGuestRequestsUrl);
      return;
    }

    setIsSubmittingOffer(true);
    try {
      await deleteOffer(existingResponse.id);
      resetOfferDraft(
        setOfferAmount,
        setOfferComment,
        setOfferAvailability,
        setSubmittedOfferAmount,
        setOfferSheetMode,
      );
      setOfferSheetInUrl(false);
      toast.success(t(I18N_KEYS.requestDetails.responseCancelled));
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['offers-my'] }),
        qc.invalidateQueries({ queryKey: providerQK.myProfile() }),
      ]);
    } catch {
      toast.error(t(I18N_KEYS.requestDetails.responseFailed));
    } finally {
      setIsSubmittingOffer(false);
    }
  }, [
    authStatus,
    existingResponse?.id,
    isSubmittingOffer,
    qc,
    router,
    setOfferSheetInUrl,
    t,
    workspaceGuestRequestsUrl,
    workspacePublicRequestsUrl,
  ]);

  const handleOfferSuccessBack = React.useCallback(() => {
    closeOfferSheet();
    router.push(isAuthed ? workspacePublicRequestsUrl : workspaceGuestRequestsUrl);
  }, [closeOfferSheet, isAuthed, router, workspaceGuestRequestsUrl, workspacePublicRequestsUrl]);

  return {
    offerAmount,
    offerComment,
    offerAvailability,
    offerSheetMode,
    isSubmittingOffer,
    isOfferSheetOpen,
    hasOffer,
    setOfferAmount,
    setOfferComment,
    setOfferAvailability,
    requireAuth,
    openOfferForm,
    handleApply,
    handleOfferSubmit,
    handleOfferCancel,
    closeOfferSheet,
    handleOfferSuccessBack,
  };
}

