'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import type { ContractDto } from '@/lib/api/dto/contracts';
import type { OfferDto } from '@/lib/api/dto/offers';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import { getWorkspacePublicRequestsBatch } from '@/lib/api/workspace';
import { workspaceQK } from '@/features/workspace/data';

type Params = {
  enabled?: boolean;
  filteredContracts: ContractDto[];
  isWorkspaceAuthed: boolean;
  locale: string;
};

export function useWorkspaceContractRequestsData({
  enabled = true,
  filteredContracts,
  isWorkspaceAuthed,
  locale,
}: Params) {
  const contractRequestIds = React.useMemo(
    () =>
      enabled
        ? Array.from(new Set(filteredContracts.map((item) => item.requestId).filter(Boolean)))
        : [],
    [enabled, filteredContracts],
  );

  const { data: contractRequestsById = new Map<string, RequestResponseDto>() } = useQuery({
    queryKey: workspaceQK.requestsByContractIds(locale, contractRequestIds),
    enabled: enabled && isWorkspaceAuthed && contractRequestIds.length > 0,
    queryFn: async () => {
      const batch = await getWorkspacePublicRequestsBatch(contractRequestIds);
      return new Map<string, RequestResponseDto>(
        batch.items.map((request) => [request.id, request]),
      );
    },
  });

  const contractRequests = React.useMemo(() => {
    if (!enabled) {
      return [];
    }

    const items: RequestResponseDto[] = [];
    const seen = new Set<string>();

    filteredContracts.forEach((item) => {
      if (!item.requestId || seen.has(item.requestId)) return;
      seen.add(item.requestId);
      const request = contractRequestsById.get(item.requestId);
      if (request) {
        items.push(request);
      }
    });

    return items;
  }, [contractRequestsById, enabled, filteredContracts]);

  const contractOffersByRequest = React.useMemo(() => {
    if (!enabled) {
      return new Map<string, OfferDto>();
    }

    const map = new Map<string, OfferDto>();
    filteredContracts.forEach((item) => {
      map.set(item.requestId, {
        id: item.offerId,
        requestId: item.requestId,
        providerUserId: item.providerUserId,
        clientUserId: item.clientId,
        status: item.status === 'cancelled' ? 'declined' : 'accepted',
        message: null,
        amount: item.priceAmount,
        priceType: item.priceType,
        availableAt: null,
        availabilityNote: null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      });
    });
    return map;
  }, [enabled, filteredContracts]);

  return {
    contractRequests,
    contractOffersByRequest,
  };
}
