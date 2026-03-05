import type { AuthSnapshot } from '@/hooks/useAuthSnapshot';
import type { useWorkspaceRouteState } from '@/features/workspace';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

export type WorkspaceTranslator = (key: I18nKey) => string;
export type WorkspaceRouteState = ReturnType<typeof useWorkspaceRouteState>;

export type WorkspaceBranchProps = {
  t: WorkspaceTranslator;
  locale: Locale;
  auth: AuthSnapshot;
  isAuthed: boolean;
  isWorkspaceAuthed: boolean;
  isPersonalized: boolean;
  routeState: WorkspaceRouteState;
};
