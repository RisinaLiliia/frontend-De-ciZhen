'use client';

import type { ComponentProps } from 'react';

import { WorkspaceTopProvidersAside, type WorkspacePrivateIntroProps } from '@/features/workspace/requests';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import type { WorkspaceTab } from '@/features/workspace/requests/workspace.types';

type Translator = (key: I18nKey) => string;

export type WorkspaceAsideBaseProps = Omit<
  ComponentProps<typeof WorkspaceTopProvidersAside>,
  'ctaHref' | 'pendingFavoriteProviderIds' | 'onToggleFavorite'
>;

type BuildWorkspacePrivateIntroPropsArgs = {
  locale: Locale;
  activePublicSection: PublicWorkspaceSection | null;
  activeWorkspaceTab: WorkspaceTab;
  createRequestHref: string;
  showQuickAction?: boolean;
  preferredRequestsRole?: WorkspacePrivateIntroProps['preferredRequestsRole'];
};

type BuildWorkspaceAsideBasePropsArgs = {
  t: Translator;
  isProvidersLoading: boolean;
  isProvidersError: boolean;
  topProviders: WorkspaceAsideBaseProps['providers'];
  favoriteProviderIds: WorkspaceAsideBaseProps['favoriteProviderIds'];
};

export function buildWorkspacePrivateIntroProps({
  locale,
  activePublicSection,
  activeWorkspaceTab,
  createRequestHref,
  showQuickAction = true,
  preferredRequestsRole = null,
}: BuildWorkspacePrivateIntroPropsArgs): WorkspacePrivateIntroProps {
  return {
    locale,
    activePublicSection,
    activeWorkspaceTab,
    quickActionHref: createRequestHref,
    showQuickAction,
    preferredRequestsRole,
  };
}

export function buildWorkspaceAsideBaseProps({
  t,
  isProvidersLoading,
  isProvidersError,
  topProviders,
  favoriteProviderIds,
}: BuildWorkspaceAsideBasePropsArgs): WorkspaceAsideBaseProps {
  return {
    isLoading: isProvidersLoading,
    isError: isProvidersError,
    errorLabel: t(I18N_KEYS.requestsPage.error),
    title: t(I18N_KEYS.homePublic.topProviders),
    subtitle: t(I18N_KEYS.homePublic.topProvidersSubtitle),
    ctaLabel: t(I18N_KEYS.homePublic.topProvidersCta),
    providers: topProviders,
    favoriteProviderIds,
  };
}
