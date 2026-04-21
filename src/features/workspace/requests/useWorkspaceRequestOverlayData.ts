'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { MyRequestsViewCard } from '@/features/workspace/requests/myRequestsView.model';
import { workspaceQK } from '@/features/workspace/requests/queryKeys';
import { fetchWorkspaceManagedRequest } from '@/features/workspace/requests/useWorkspaceRequestOverlayActions';
import { listMyContracts } from '@/lib/api/contracts';
import type { ContractDto } from '@/lib/api/dto/contracts';
import type { OfferDto } from '@/lib/api/dto/offers';
import { listMyProviderOffers, listOffersByRequest } from '@/lib/api/offers';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import type { Locale } from '@/lib/i18n/t';

export function formatDialogDate(locale: Locale, value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDialogPrice(locale: Locale, value?: number | null) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatOfferTimestamp(locale: Locale, value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-US', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function toDateTimeLocalValue(value?: string | null) {
  const date = value ? new Date(value) : new Date(Date.now() + 60 * 60 * 1000);
  if (!Number.isFinite(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
}

export function resolveOfferStatusBadge(locale: Locale, status: OfferDto['status']) {
  if (status === 'accepted') {
    return {
      label: locale === 'de' ? 'Angenommen' : 'Accepted',
      className: 'status-badge status-badge--success',
    };
  }
  if (status === 'declined') {
    return {
      label: locale === 'de' ? 'Abgelehnt' : 'Declined',
      className: 'status-badge status-badge--danger',
    };
  }
  if (status === 'withdrawn') {
    return {
      label: locale === 'de' ? 'Zurückgezogen' : 'Withdrawn',
      className: 'status-badge status-badge--warning',
    };
  }
  return {
    label: locale === 'de' ? 'Neu' : 'New',
    className: 'status-badge status-badge--info',
  };
}

export function resolveContractStatusBadge(locale: Locale, status: ContractDto['status']) {
  if (status === 'completed') {
    return {
      label: locale === 'de' ? 'Abgeschlossen' : 'Completed',
      className: 'status-badge status-badge--success',
    };
  }
  if (status === 'confirmed' || status === 'in_progress') {
    return {
      label: locale === 'de' ? 'Bestätigt' : 'Confirmed',
      className: 'status-badge status-badge--success',
    };
  }
  if (status === 'cancelled') {
    return {
      label: locale === 'de' ? 'Storniert' : 'Cancelled',
      className: 'status-badge status-badge--danger',
    };
  }
  return {
    label: locale === 'de' ? 'Ausstehend' : 'Pending',
    className: 'status-badge status-badge--warning',
  };
}

export function cardlessTitle(locale: Locale) {
  return locale === 'de' ? 'Anfrage' : 'Request';
}

export function useWorkspaceManagedRequestData({
  locale,
  requestId,
  attemptOwner = false,
  preferOwner = false,
}: {
  locale: Locale;
  requestId: string;
  attemptOwner?: boolean;
  preferOwner?: boolean;
}) {
  const qc = useQueryClient();

  return useQuery({
    queryKey: workspaceQK.managedRequest({
      requestId,
      locale,
      attemptOwner,
      preferOwner,
    }),
    queryFn: () => fetchWorkspaceManagedRequest({
      requestId,
      locale,
      qc,
      attemptOwner,
      preferOwner,
    }),
    staleTime: 60_000,
    retry: 0,
    refetchOnWindowFocus: false,
  });
}

export function useWorkspaceRequestOffersData(requestId: string) {
  const query = useQuery({
    queryKey: ['workspace-request-offers', requestId],
    queryFn: () => withStatusFallback(() => listOffersByRequest(requestId), [] as OfferDto[]),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
  const offers = query.data ?? [];
  const acceptedOfferId = offers.find((offer) => offer.status === 'accepted')?.id ?? null;
  const actionableOffers = offers.filter((offer) => offer.status !== 'withdrawn');

  return {
    ...query,
    acceptedOfferId,
    actionableOffers,
    offers,
  };
}

export function useWorkspaceRequestDecisionData({
  card,
  locale,
}: {
  card: MyRequestsViewCard;
  locale: Locale;
}) {
  const { data: contracts = [] } = useQuery({
    queryKey: workspaceQK.contractsMyClient(),
    queryFn: () => withStatusFallback(() => listMyContracts({ role: 'client' }), [] as ContractDto[]),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const contract = React.useMemo(
    () => contracts.find((item) => item.requestId === card.requestId) ?? null,
    [card.requestId, contracts],
  );
  const chatAction = React.useMemo(
    () => card.status.actions.find((action) => action.kind === 'open_chat' && Boolean(action.chatInput))
      ?? (card.decision.primaryAction?.kind === 'open_chat' ? card.decision.primaryAction : null),
    [card.decision.primaryAction, card.status.actions],
  );
  const chatInput = chatAction?.chatInput ?? null;
  const chatLabel = chatAction?.label ?? (locale === 'de' ? 'Chat' : 'Chat');
  const contractPrice = contract?.priceAmount != null
    ? formatDialogPrice(locale, contract.priceAmount)
    : null;
  const contractMeta = [
    contractPrice,
    contract?.status ? resolveContractStatusBadge(locale, contract.status).label : null,
  ].filter(Boolean).join(' · ');

  return {
    chatInput,
    chatLabel,
    contract,
    contractMeta,
  };
}

export function useWorkspaceProviderOfferSheetData({
  locale,
  requestId,
}: {
  locale: Locale;
  requestId: string;
}) {
  const requestQuery = useWorkspaceManagedRequestData({ locale, requestId, attemptOwner: false });
  const { data: myOffers = [] } = useQuery({
    queryKey: workspaceQK.offersMy(),
    queryFn: () => withStatusFallback(() => listMyProviderOffers(), [] as OfferDto[]),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
  const existingResponse = React.useMemo(
    () => myOffers.find((item) => item.requestId === requestId) ?? null,
    [myOffers, requestId],
  );

  return {
    ...requestQuery,
    existingResponse,
    request: requestQuery.data?.request ?? null,
  };
}
