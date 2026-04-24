'use client';

import * as React from 'react';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { providerQK } from '@/features/provider/queries';
import { workspaceQK } from '@/features/workspace/requests/queryKeys';
import { completeContract, confirmContract } from '@/lib/api/contracts';
import type { OfferDto } from '@/lib/api/dto/offers';
import { createProviderReview } from '@/lib/api/reviews';
import {
  acceptOffer,
  createOffer,
  declineOffer,
  deleteOffer,
  updateOffer,
} from '@/lib/api/offers';
import { ApiError } from '@/lib/api/http-error';
import { fetchManagedRequestDetails } from '@/features/requests/details/requestDetails.data';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { useT } from '@/lib/i18n/useT';

type ManagedRequestPreview = {
  id: string;
  price?: number | null;
};

type ExistingProviderOffer = Pick<OfferDto, 'id' | 'amount' | 'message' | 'availabilityNote' | 'availableAt'> | null;

function useWorkspaceRequestOverlayInvalidation(requestId: string) {
  const qc = useQueryClient();

  const invalidateOfferReviewState = React.useCallback(async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['workspace-request-offers', requestId] }),
      qc.invalidateQueries({ queryKey: workspaceQK.offersMyClient() }),
      qc.invalidateQueries({ queryKey: workspaceQK.contractsMyClient() }),
      qc.invalidateQueries({ queryKey: workspaceQK.requestsMy() }),
      qc.invalidateQueries({ queryKey: workspaceQK.workspaceRequestsPrefix() }),
      qc.invalidateQueries({ queryKey: workspaceQK.workspacePrivateOverviewPrefix() }),
      qc.invalidateQueries({ queryKey: workspaceQK.requestDetail(requestId) }),
      qc.invalidateQueries({ queryKey: workspaceQK.managedRequestPrefix(requestId) }),
    ]);
  }, [qc, requestId]);

  const invalidateDecisionState = React.useCallback(async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: workspaceQK.contractsMyClient() }),
      qc.invalidateQueries({ queryKey: workspaceQK.requestsMy() }),
      qc.invalidateQueries({ queryKey: workspaceQK.workspaceRequestsPrefix() }),
      qc.invalidateQueries({ queryKey: workspaceQK.workspacePrivateOverviewPrefix() }),
      qc.invalidateQueries({ queryKey: workspaceQK.requestDetail(requestId) }),
      qc.invalidateQueries({ queryKey: workspaceQK.managedRequestPrefix(requestId) }),
    ]);
  }, [qc, requestId]);

  const invalidateProviderOfferState = React.useCallback(async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: workspaceQK.offersMy() }),
      qc.invalidateQueries({ queryKey: workspaceQK.requestsMy() }),
      qc.invalidateQueries({ queryKey: workspaceQK.workspaceRequestsPrefix() }),
      qc.invalidateQueries({ queryKey: workspaceQK.workspacePrivateOverviewPrefix() }),
      qc.invalidateQueries({ queryKey: providerQK.myProfile() }),
    ]);
  }, [qc]);

  return {
    invalidateDecisionState,
    invalidateOfferReviewState,
    invalidateProviderOfferState,
  };
}

export async function fetchWorkspaceManagedRequest(params: {
  requestId: string;
  locale: Locale;
  qc: QueryClient;
  attemptOwner?: boolean;
  preferOwner?: boolean;
}) {
  return fetchManagedRequestDetails({
    requestId: params.requestId,
    locale: params.locale,
    qc: params.qc,
    attemptOwner: params.attemptOwner ?? false,
    preferOwner: params.preferOwner,
  });
}

export function useWorkspaceRequestOfferActions({
  locale,
  requestId,
}: {
  locale: Locale;
  requestId: string;
}) {
  const t = useT();
  const { invalidateOfferReviewState } = useWorkspaceRequestOverlayInvalidation(requestId);
  const [pendingOfferActionId, setPendingOfferActionId] = React.useState<string | null>(null);

  const acceptRequestOffer = React.useCallback(async (offerId: string) => {
    if (pendingOfferActionId === offerId) return false;
    setPendingOfferActionId(offerId);
    try {
      await acceptOffer(offerId);
      toast.success(locale === 'de' ? 'Angebot angenommen.' : 'Offer accepted.');
      await invalidateOfferReviewState();
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
      return false;
    } finally {
      setPendingOfferActionId(null);
    }
  }, [invalidateOfferReviewState, locale, pendingOfferActionId, t]);

  const declineRequestOffer = React.useCallback(async (offerId: string) => {
    if (pendingOfferActionId === offerId) return false;
    setPendingOfferActionId(offerId);
    try {
      await declineOffer(offerId);
      toast.success(locale === 'de' ? 'Angebot abgelehnt.' : 'Offer declined.');
      await invalidateOfferReviewState();
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
      return false;
    } finally {
      setPendingOfferActionId(null);
    }
  }, [invalidateOfferReviewState, locale, pendingOfferActionId, t]);

  return {
    acceptRequestOffer,
    declineRequestOffer,
    pendingOfferActionId,
  };
}

export function useWorkspaceRequestDecisionActions({
  locale,
  requestId,
}: {
  locale: Locale;
  requestId: string;
}) {
  const t = useT();
  const { invalidateDecisionState } = useWorkspaceRequestOverlayInvalidation(requestId);
  const [isSubmittingDecision, setIsSubmittingDecision] = React.useState(false);

  const confirmRequestContract = React.useCallback(async ({
    contractId,
    startAt,
    durationMin,
    note,
  }: {
    contractId: string;
    startAt: string;
    durationMin: string;
    note: string;
  }) => {
    setIsSubmittingDecision(true);
    try {
      await confirmContract(contractId, {
        startAt: new Date(startAt).toISOString(),
        durationMin: durationMin.trim() ? Number(durationMin) : undefined,
        note: note.trim() || undefined,
      });
      toast.success(locale === 'de' ? 'Vertrag bestätigt.' : 'Contract confirmed.');
      await invalidateDecisionState();
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
      return false;
    } finally {
      setIsSubmittingDecision(false);
    }
  }, [invalidateDecisionState, locale, t]);

  const completeRequestContract = React.useCallback(async (contractId: string) => {
    setIsSubmittingDecision(true);
    try {
      await completeContract(contractId);
      toast.success(locale === 'de' ? 'Abschluss bestätigt.' : 'Completion confirmed.');
      await invalidateDecisionState();
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
      return false;
    } finally {
      setIsSubmittingDecision(false);
    }
  }, [invalidateDecisionState, locale, t]);

  return {
    completeRequestContract,
    confirmRequestContract,
    isSubmittingDecision,
  };
}

export function useWorkspaceCompletionReviewActions() {
  const t = useT();
  const qc = useQueryClient();
  const [isSubmittingReview, setIsSubmittingReview] = React.useState(false);

  const submitCompletionReview = React.useCallback(async ({
    bookingId,
    rating,
    text,
  }: {
    bookingId: string;
    rating: number;
    text: string;
  }) => {
    setIsSubmittingReview(true);
    try {
      await createProviderReview({
        bookingId,
        rating,
        text: text.trim() || undefined,
      });
      toast.success(t(I18N_KEYS.requestsPage.userReviewFormSuccess));
      await Promise.all([
        qc.invalidateQueries({ queryKey: workspaceQK.reviewsMyPrefix() }),
        qc.invalidateQueries({ queryKey: workspaceQK.bookingsMyReviewable() }),
        qc.invalidateQueries({ queryKey: workspaceQK.contractsMyClient() }),
        qc.invalidateQueries({ queryKey: workspaceQK.requestsMy() }),
        qc.invalidateQueries({ queryKey: workspaceQK.workspaceRequestsPrefix() }),
        qc.invalidateQueries({ queryKey: workspaceQK.workspacePrivateOverviewPrefix() }),
      ]);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      toast.error(message || t(I18N_KEYS.requestsPage.userReviewFormError));
      return false;
    } finally {
      setIsSubmittingReview(false);
    }
  }, [qc, t]);

  return {
    isSubmittingReview,
    submitCompletionReview,
  };
}

export function useWorkspaceProviderOfferSheetActions({
  onClose,
  onResetDraft,
  request,
  requestId,
  existingResponse,
}: {
  onClose: () => void;
  onResetDraft: () => void;
  request: ManagedRequestPreview | null;
  requestId: string;
  existingResponse: ExistingProviderOffer;
}) {
  const t = useT();
  const { invalidateProviderOfferState } = useWorkspaceRequestOverlayInvalidation(requestId);
  const [isSubmittingOffer, setIsSubmittingOffer] = React.useState(false);

  const submitProviderOffer = React.useCallback(async ({
    amountValue,
    commentValue,
    availabilityValue,
  }: {
    amountValue: string;
    commentValue: string;
    availabilityValue: string;
  }) => {
    if (!request) return 'noop' as const;

    const parsedAmount = Number(amountValue);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.message(t(I18N_KEYS.requestDetails.responseAmountInvalid));
      return 'invalid' as const;
    }

    setIsSubmittingOffer(true);
    try {
      const payload = {
        amount: parsedAmount,
        message: commentValue.trim() || undefined,
        availabilityNote: availabilityValue.trim() || undefined,
      };

      if (existingResponse?.id) {
        await updateOffer(existingResponse.id, payload);
        toast.success(t(I18N_KEYS.requestDetails.responseUpdated));
        await invalidateProviderOfferState();
        onClose();
        return 'updated' as const;
      }

      await createOffer({
        requestId: request.id,
        ...payload,
      });
      await invalidateProviderOfferState();
      return 'created' as const;
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
        toast.message(t(I18N_KEYS.requestDetails.responseEditUnavailable));
      } else if (error instanceof ApiError && error.status === 409) {
        toast.message(t(I18N_KEYS.requestDetails.responseAlready));
        await invalidateProviderOfferState();
        onClose();
        return 'updated' as const;
      } else if (error instanceof ApiError && error.status === 403) {
        toast.error(error.message || t(I18N_KEYS.requestDetails.responseFailed));
      } else {
        toast.error(t(I18N_KEYS.requestDetails.responseFailed));
      }
      return 'failed' as const;
    } finally {
      setIsSubmittingOffer(false);
    }
  }, [existingResponse?.id, invalidateProviderOfferState, onClose, request, t]);

  const cancelProviderOffer = React.useCallback(async () => {
    if (!existingResponse?.id) {
      onResetDraft();
      onClose();
      return;
    }

    setIsSubmittingOffer(true);
    try {
      await deleteOffer(existingResponse.id);
      await invalidateProviderOfferState();
      toast.success(t(I18N_KEYS.requestDetails.responseCancelled));
      onResetDraft();
      onClose();
    } catch {
      toast.error(t(I18N_KEYS.requestDetails.responseFailed));
    } finally {
      setIsSubmittingOffer(false);
    }
  }, [existingResponse?.id, invalidateProviderOfferState, onClose, onResetDraft, t]);

  return {
    cancelProviderOffer,
    isSubmittingOffer,
    submitProviderOffer,
  };
}
