'use client';

import type { I18nKey } from '@/lib/i18n/keys';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';

export type WorkspaceNavTranslator = (key: I18nKey) => string;

type BuildWorkspaceNavHeaderArgs = {
  t: WorkspaceNavTranslator;
  userName?: string | null;
};

export function normalizeWorkspaceNavCount(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

export function isWorkspacePublicSection(value: PublicWorkspaceSection | null) {
  return value === 'requests' || value === 'providers' || value === 'stats' || value === 'reviews' || value === 'profile';
}

export function buildWorkspaceNavHeader({ t, userName }: BuildWorkspaceNavHeaderArgs) {
  return {
    navTitle: `${t(I18N_KEYS.requestsPage.navGreeting)}, ${(userName ?? '').trim() || t(I18N_KEYS.requestsPage.navUserFallback)}!`,
    navSubtitle: t(I18N_KEYS.requestsPage.navSubtitle),
  };
}
