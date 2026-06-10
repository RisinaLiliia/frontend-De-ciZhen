import { useQuery } from '@tanstack/react-query';

import type { ProviderProfileDto } from '@/lib/api/dto/providers';
import { getMyProviderProfile } from '@/lib/api/providers';
import { withStatusFallback } from '@/lib/api/withStatusFallback';

export const providerQK = {
  myProfile: () => ['provider', 'me', 'profile'] as const,
  publicById: (providerId: string | null | undefined) =>
    ['providers-public', 'detail', providerId ?? null] as const,
  publicList: (args?: { cityId?: string | null; serviceKey?: string | null }) =>
    ['providers-public', 'list', args?.cityId ?? null, args?.serviceKey ?? null] as const,
};

export function useMyProviderProfile(enabled = true) {
  return useQuery<ProviderProfileDto | null>({
    queryKey: providerQK.myProfile(),
    queryFn: () => withStatusFallback(() => getMyProviderProfile(), null),
    enabled,
  });
}
