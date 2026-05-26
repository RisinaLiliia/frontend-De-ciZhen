import type { AppMeDto } from '@/lib/api/dto/auth';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import type { WorkspaceProvidersResponseDto } from '@/lib/api/dto/workspace';

function trimToNull(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function hasMatchingProviderIdentity(
  provider: Pick<ProviderPublicDto, 'id' | 'userId'> | null | undefined,
  candidate: Pick<ProviderPublicDto, 'id' | 'userId'> | null | undefined,
) {
  if (!provider || !candidate) return false;

  const providerIds = new Set([
    trimToNull(provider.id),
    trimToNull(provider.userId),
  ].filter(Boolean));
  const candidateIds = [
    trimToNull(candidate.id),
    trimToNull(candidate.userId),
  ].filter(Boolean);

  return candidateIds.some((value) => providerIds.has(value));
}

export function isOwnPublicProvider(provider: ProviderPublicDto | null | undefined, me: AppMeDto | null | undefined) {
  if (!provider || !me) return false;

  const providerUserId = trimToNull(provider.userId);
  const providerId = trimToNull(provider.id);
  const meUserId = trimToNull(me.id);
  const meProviderProfileId = trimToNull(me.providerProfile?.id);

  return Boolean(
    (providerUserId && meUserId && providerUserId === meUserId) ||
      (providerId && meProviderProfileId && providerId === meProviderProfileId),
  );
}

export function resolvePublicProviderAvatarUrl(
  provider: ProviderPublicDto | null | undefined,
  me: AppMeDto | null | undefined,
) {
  const providerAvatarUrl = trimToNull(provider?.avatarUrl);
  if (providerAvatarUrl) return providerAvatarUrl;

  if (!isOwnPublicProvider(provider, me)) return provider?.avatarUrl;

  return trimToNull(me?.avatar?.url) ?? provider?.avatarUrl;
}

export function backfillOwnProviderAvatar(
  provider: ProviderPublicDto | null | undefined,
  me: AppMeDto | null | undefined,
) {
  if (!provider) return undefined;

  const avatarUrl = resolvePublicProviderAvatarUrl(provider, me);
  if (avatarUrl === provider.avatarUrl) return provider;

  return {
    ...provider,
    avatarUrl,
  };
}

export function backfillOwnProviderAvatars(
  providers: ProviderPublicDto[],
  me: AppMeDto | null | undefined,
) {
  return providers.map((provider) => backfillOwnProviderAvatar(provider, me) ?? provider);
}

export function backfillProviderAvatarFromCandidates(
  provider: ProviderPublicDto | null | undefined,
  candidates: ProviderPublicDto[],
) {
  if (!provider) return undefined;
  if (trimToNull(provider.avatarUrl)) return provider;

  const candidate = candidates.find((item) => hasMatchingProviderIdentity(provider, item));
  const avatarUrl = trimToNull(candidate?.avatarUrl);
  if (!avatarUrl) return provider;

  return {
    ...provider,
    avatarUrl,
  };
}

export function backfillProviderCardAvatarsFromCandidates(
  items: WorkspaceProvidersResponseDto['list']['items'],
  candidates: ProviderPublicDto[],
): WorkspaceProvidersResponseDto['list']['items'] {
  return items.map((item) => {
    if (trimToNull(item.card.avatarUrl)) return item;

    const candidate = candidates.find((provider) =>
      hasMatchingProviderIdentity(
        { id: item.id, userId: item.userId ?? undefined },
        provider,
      ));
    const avatarUrl = trimToNull(candidate?.avatarUrl);
    if (!avatarUrl) return item;

    return {
      ...item,
      card: {
        ...item.card,
        avatarUrl,
      },
    };
  });
}
