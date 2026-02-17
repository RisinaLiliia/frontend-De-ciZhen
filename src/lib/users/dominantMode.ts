export type UserDominantStats = {
  requestsCreated: number;
  offersSent: number;
  contractsAsProvider: number;
};

export type UserDominantMode = 'provider' | 'client';

export function getUserDominantMode(
  stats?: UserDominantStats,
  hasProviderProfile?: boolean,
): UserDominantMode {
  if (!stats) {
    return hasProviderProfile ? 'provider' : 'client';
  }

  const providerScore = stats.offersSent + stats.contractsAsProvider;
  const clientScore = stats.requestsCreated;

  return providerScore > clientScore ? 'provider' : 'client';
}

