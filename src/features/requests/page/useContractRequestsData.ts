'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import type { ContractDto } from '@/lib/api/dto/contracts';
import type { OfferDto } from '@/lib/api/dto/offers';
import { getPublicRequestById } from '@/lib/api/requests';

type Params = {
  filteredContracts: ContractDto[];
  isWorkspaceAuthed: boolean;
  locale: string;
};

export function useContractRequestsData({ filteredContracts, isWorkspaceAuthed, locale }: Params) {
  const contractRequestIds = React.useMemo(
    () => Array.from(new Set(filteredContracts.map((item) => item.requestId).filter(Boolean))),
    [filteredContracts],
  );

  const { data: contractRequestsById = new Map<string, Awaited<ReturnType<typeof getPublicRequestById>>>() } = useQuery({
    queryKey: ['requests-by-contract-ids', locale, ...contractRequestIds],
    enabled: isWorkspaceAuthed && contractRequestIds.length > 0,
    queryFn: async () => {
      const pairs = await Promise.all(
        contractRequestIds.map(async (id) => {
          try {
            const request = await getPublicRequestById(id, { locale });
            return [id, request] as const;
          } catch {
            return [id, null] as const;
          }
        }),
      );
      const map = new Map<string, Awaited<ReturnType<typeof getPublicRequestById>>>();
      pairs.forEach(([id, request]) => {
        if (request) map.set(id, request);
      });
      return map;
    },
  });

  const contractRequests = React.useMemo(() => {
    const fallbackDate = new Date().toISOString();
    const items: Awaited<ReturnType<typeof getPublicRequestById>>[] = [];
    const seen = new Set<string>();

    filteredContracts.forEach((item) => {
      if (!item.requestId || seen.has(item.requestId)) return;
      seen.add(item.requestId);
      const request = contractRequestsById.get(item.requestId);
      if (request) {
        items.push(request);
        return;
      }

      items.push({
        id: item.requestId,
        serviceKey: 'service',
        cityId: 'city',
        cityName: null,
        categoryKey: null,
        categoryName: null,
        subcategoryName: null,
        propertyType: 'apartment',
        area: 0,
        price: item.priceAmount ?? null,
        preferredDate: item.updatedAt || item.createdAt || fallbackDate,
        isRecurring: false,
        title: `Contract #${item.id.slice(-6)}`,
        description: null,
        photos: null,
        imageUrl: null,
        tags: null,
        clientId: item.clientId,
        clientName: null,
        clientAvatarUrl: null,
        clientCity: null,
        clientRatingAvg: null,
        clientRatingCount: null,
        clientIsOnline: null,
        clientLastSeenAt: null,
        status:
          item.status === 'completed'
            ? 'closed'
            : item.status === 'cancelled'
              ? 'cancelled'
              : 'matched',
        createdAt: item.createdAt,
      });
    });

    return items;
  }, [contractRequestsById, filteredContracts]);

  const contractOffersByRequest = React.useMemo(() => {
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
  }, [filteredContracts]);

  return {
    contractRequests,
    contractOffersByRequest,
  };
}
