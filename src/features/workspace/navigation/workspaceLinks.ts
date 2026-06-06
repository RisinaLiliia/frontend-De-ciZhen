export function buildWorkspaceHref(params: {
  currentSearch: string | URLSearchParams;
  section?: string | null;
  patch?: Record<string, string | null | undefined>;
  removeKeys?: string[];
}) {
  const searchParams =
    typeof params.currentSearch === 'string'
      ? new URLSearchParams(params.currentSearch)
      : new URLSearchParams(params.currentSearch.toString());

  if (params.section) {
    searchParams.set('section', params.section);
    searchParams.delete('tab');
  }

  params.removeKeys?.forEach((key) => {
    searchParams.delete(key);
  });

  Object.entries(params.patch ?? {}).forEach(([key, value]) => {
    const normalized = typeof value === 'string' ? value.trim() : value;
    if (normalized) {
      searchParams.set(key, normalized);
      return;
    }
    searchParams.delete(key);
  });

  const query = searchParams.toString();
  return query ? `/workspace?${query}` : '/workspace';
}
