import { useQuery } from '@tanstack/react-query';

import type { ProviderProfileDto } from '@/lib/api/dto/providers';
import { getMyProviderProfile } from '@/lib/api/providers';
import { withStatusFallback } from '@/lib/api/withStatusFallback';

export const providerQK = {
  myProfile: () => ['provider', 'me', 'profile'] as const,
};

export function useMyProviderProfile(enabled = true) {
  return useQuery<ProviderProfileDto | null>({
    queryKey: providerQK.myProfile(),
    queryFn: () => withStatusFallback(() => getMyProviderProfile(), null),
    enabled,
  });
}
