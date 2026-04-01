import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import { listMyRequests } from '@/lib/api/requests';
import { listMyProviderOffers, listMyClientOffers } from '@/lib/api/offers';
import { listMyContracts } from '@/lib/api/contracts';
import { listConversations } from '@/lib/api/chat';
import { listFavorites } from '@/lib/api/favorites';
import { getMyProviderProfile, listPublicProviders } from '@/lib/api/providers';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { findProviderPublicByUserId } from '@/features/profile/profileWorkspace.presentation';

type UseProfileWorkspaceDataParams = {
  authMeId?: string | null;
  hasProviderProfile: boolean;
};

export function useProfileWorkspaceData({
  authMeId,
  hasProviderProfile,
}: UseProfileWorkspaceDataParams) {
  const { data: myRequests = [] } = useQuery({
    queryKey: ['requests-my'],
    queryFn: () => withStatusFallback(() => listMyRequests(), []),
  });
  const { data: providerOffers = [] } = useQuery({
    queryKey: ['offers-my'],
    queryFn: () => withStatusFallback(() => listMyProviderOffers(), []),
  });
  const { data: clientOffers = [] } = useQuery({
    queryKey: ['offers-my-client'],
    queryFn: () => withStatusFallback(() => listMyClientOffers(), []),
  });
  const { data: contracts = [] } = useQuery({
    queryKey: ['contracts-my-all'],
    queryFn: () => withStatusFallback(() => listMyContracts({ role: 'all' }), []),
  });
  const { data: inbox = [] } = useQuery({
    queryKey: ['chat-inbox', 'all'],
    queryFn: async () =>
      withStatusFallback(async () => (await listConversations()).items, []),
  });
  const { data: favoriteRequests = [] } = useQuery({
    queryKey: ['favorite-requests'],
    queryFn: () => withStatusFallback(() => listFavorites('request'), []),
  });
  const { data: favoriteProviders = [] } = useQuery({
    queryKey: ['favorite-providers'],
    queryFn: () => withStatusFallback(() => listFavorites('provider'), []),
  });
  const { data: myProviderPublic } = useQuery({
    queryKey: ['provider-public-self', authMeId],
    enabled: Boolean(authMeId),
    queryFn: async () => {
      const list = await listPublicProviders();
      return findProviderPublicByUserId(list, authMeId);
    },
  });
  const { data: myProviderProfile } = useQuery({
    queryKey: ['provider-profile-self', authMeId],
    enabled: Boolean(authMeId && hasProviderProfile),
    queryFn: () => withStatusFallback(() => getMyProviderProfile(), null),
  });

  const offersTotal = providerOffers.length + clientOffers.length;
  const unreadTotal = inbox.reduce((sum, conversation) => {
    if (typeof conversation.unread === 'number') {
      return sum + Math.max(conversation.unread, 0);
    }
    return sum + Object.values(conversation.unreadCount ?? {}).reduce((count, value) => count + value, 0);
  }, 0);
  const favoritesTotal = favoriteRequests.length + favoriteProviders.length;
  const ratingValue = myProviderPublic?.ratingAvg?.toFixed(1) ?? '—';
  const reviewCount = myProviderPublic?.ratingCount ?? 0;
  const dominantStats = React.useMemo(
    () => ({
      requestsCreated: myRequests.length,
      offersSent: providerOffers.length,
      contractsAsProvider: contracts.filter((item) => item.providerUserId === authMeId).length,
    }),
    [authMeId, contracts, myRequests.length, providerOffers.length],
  );
  const overviewCounts = React.useMemo(
    () => ({
      requests: myRequests.length,
      offers: offersTotal,
      contracts: contracts.length,
      inbox: unreadTotal,
    }),
    [contracts.length, myRequests.length, offersTotal, unreadTotal],
  );

  return {
    offersTotal,
    unreadTotal,
    favoritesTotal,
    ratingValue,
    reviewCount,
    dominantStats,
    overviewCounts,
    myProviderProfile,
  };
}
