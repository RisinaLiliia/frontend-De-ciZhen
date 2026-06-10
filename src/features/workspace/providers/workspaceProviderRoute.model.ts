import { buildWorkspaceHref } from '@/features/workspace/navigation/workspaceLinks';

export const WORKSPACE_PROVIDER_ID_QUERY_KEY = 'providerId';

type SearchSource =
  | string
  | URLSearchParams
  | {
      toString(): string;
    };

function normalizeSearchParams(currentSearch: SearchSource) {
  if (typeof currentSearch === 'string') {
    return new URLSearchParams(currentSearch);
  }

  return new URLSearchParams(currentSearch.toString());
}

export function buildWorkspaceProviderDetailHref(params: {
  currentSearch: SearchSource;
  providerId: string;
}) {
  const searchParams = normalizeSearchParams(params.currentSearch);

  return buildWorkspaceHref({
    currentSearch: searchParams,
    section: 'providers',
    patch: {
      [WORKSPACE_PROVIDER_ID_QUERY_KEY]: params.providerId,
    },
  });
}

export function clearWorkspaceProviderDetailHref(params: { currentSearch: SearchSource }) {
  const searchParams = normalizeSearchParams(params.currentSearch);

  return buildWorkspaceHref({
    currentSearch: searchParams,
    section: 'providers',
    patch: {
      [WORKSPACE_PROVIDER_ID_QUERY_KEY]: null,
    },
  });
}
