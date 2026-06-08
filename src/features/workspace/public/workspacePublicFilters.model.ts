import { ALL_OPTION_KEY } from '@/features/workspace/requests';
import { pickI18n } from '@/lib/i18n/helpers';
import type { CreateSearchEventDto } from '@/lib/api/analytics';
import type { Locale } from '@/lib/i18n/t';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';

type SearchSelection = {
  cityId: string;
  categoryKey: string;
  subcategoryKey: string;
};

type WorkspaceCity = {
  id: string;
  i18n: Record<string, string>;
};

type ResolveSearchEventArgs = {
  activePublicSection: PublicWorkspaceSection | null;
  locale: Locale;
  cities: WorkspaceCity[];
  current: SearchSelection;
  next?: Partial<SearchSelection>;
};

export function resolveWorkspacePublicSearchSelection(
  current: SearchSelection,
  next?: Partial<SearchSelection>,
) {
  const cityId = (next?.cityId ?? current.cityId) === ALL_OPTION_KEY
    ? undefined
    : (next?.cityId ?? current.cityId);
  const categoryKey = (next?.categoryKey ?? current.categoryKey) === ALL_OPTION_KEY
    ? undefined
    : (next?.categoryKey ?? current.categoryKey);
  const subcategoryKey = (next?.subcategoryKey ?? current.subcategoryKey) === ALL_OPTION_KEY
    ? undefined
    : (next?.subcategoryKey ?? current.subcategoryKey);

  return { cityId, categoryKey, subcategoryKey };
}

export function resolveWorkspacePublicSearchEventPayload({
  activePublicSection,
  locale,
  cities,
  current,
  next,
}: ResolveSearchEventArgs): CreateSearchEventDto | null {
  const selection = resolveWorkspacePublicSearchSelection(current, next);

  if (!selection.cityId && !selection.categoryKey && !selection.subcategoryKey) {
    return null;
  }

  return {
    target: activePublicSection === 'providers' ? 'provider' : 'request',
    source: activePublicSection === 'providers' ? 'workspace_providers' : 'workspace_requests',
    cityId: selection.cityId,
    cityName: selection.cityId
      ? pickI18n(cities.find((city) => city.id === selection.cityId)?.i18n ?? {}, locale) || undefined
      : undefined,
    categoryKey: selection.categoryKey,
    subcategoryKey: selection.subcategoryKey,
  };
}

export function hasWorkspacePublicActiveFilters(appliedFilterChips: Array<{ key: string }>) {
  return appliedFilterChips.length > 0;
}
