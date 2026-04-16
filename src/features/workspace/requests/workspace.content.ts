import type { WorkspaceStatusFilter, WorkspaceTab } from '@/features/workspace/requests/workspace.types';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';

type HintContent = {
  text: string;
  ctaLabel: string;
  ctaHref: string;
};

type Translate = (key: I18nKey) => string;

export function getWorkspaceTabTitles(t: Translate): Partial<Record<WorkspaceTab, string>> {
  return {
    'my-requests': t(I18N_KEYS.requestsPage.navMyOrders),
    'my-offers': t(I18N_KEYS.requestsPage.navMyOffers),
    'completed-jobs': t(I18N_KEYS.requestsPage.navCompletedJobs),
    favorites: t(I18N_KEYS.requestsPage.navFavorites),
    reviews: t(I18N_KEYS.requestsPage.reviewsWorkspaceTitle),
    profile: t(I18N_KEYS.provider.onboardingTitle),
  };
}

export function getWorkspaceSectionSubtitle(t: Translate, activeWorkspaceTab: WorkspaceTab): string {
  if (activeWorkspaceTab === 'reviews') {
    return t(I18N_KEYS.requestsPage.reviewsWorkspaceSubtitle);
  }
  return t(I18N_KEYS.requestsPage.workspaceSectionSubtitle);
}

export function getWorkspaceStatusFilters(t: Translate): Array<{ key: WorkspaceStatusFilter; label: string }> {
  return [
    { key: 'all', label: t(I18N_KEYS.requestsPage.statusAll) },
    { key: 'open', label: t(I18N_KEYS.requestsPage.statusOpen) },
    { key: 'in_progress', label: t(I18N_KEYS.requestsPage.statusInProgress) },
    { key: 'completed', label: t(I18N_KEYS.requestsPage.statusCompleted) },
  ];
}

export function getWorkspacePrimaryActionByTab(
  t: Translate,
): Partial<Record<WorkspaceTab, { href: string; label: string }>> {
  return {
    'my-requests': { label: t(I18N_KEYS.requestsPage.workspaceMyRequestsEmptyCta), href: '/request/create' },
    'my-offers': { label: t(I18N_KEYS.requestsPage.primaryActionFindNewOrders), href: '/workspace?section=requests&scope=my&period=90d&range=90d' },
    'completed-jobs': { label: t(I18N_KEYS.requestsPage.primaryActionActiveOrders), href: '/workspace?section=requests&scope=my&period=90d&range=90d' },
    favorites: { label: t(I18N_KEYS.requestsPage.primaryActionNewFavorites), href: '/workspace?section=requests' },
    reviews: { label: t(I18N_KEYS.requestsPage.navMyOrders), href: '/workspace?section=requests&scope=my&period=90d&range=90d' },
    profile: { label: t(I18N_KEYS.requestsPage.workspaceMyRequestsEmptyCta), href: '/request/create' },
  };
}

export function getProviderHint(
  t: Translate,
  profileCompleteness: number,
  recentOffers7d: number,
  acceptanceRate: number,
): HintContent {
  if (profileCompleteness < 80) {
    return {
      text: `${t(I18N_KEYS.requestsPage.providerHintProfilePrefix)} ${profileCompleteness}${t(
        I18N_KEYS.requestsPage.providerHintProfileSuffix,
      )}`,
      ctaLabel: t(I18N_KEYS.requestsPage.providerHintProfileCta),
      ctaHref: '/profile',
    };
  }
  if (recentOffers7d === 0) {
    return {
      text: t(I18N_KEYS.requestsPage.providerHintNoOffersText),
      ctaLabel: t(I18N_KEYS.requestsPage.providerHintNoOffersCta),
      ctaHref: '/workspace?section=requests',
    };
  }
  if (acceptanceRate < 25) {
    return {
      text: t(I18N_KEYS.requestsPage.providerHintLowAcceptanceText),
      ctaLabel: t(I18N_KEYS.requestsPage.providerHintLowAcceptanceCta),
      ctaHref: '/workspace?section=requests',
    };
  }
  return {
    text: t(I18N_KEYS.requestsPage.providerHintStrongText),
    ctaLabel: t(I18N_KEYS.requestsPage.providerHintStrongCta),
    ctaHref: '/workspace?section=requests&scope=my&period=90d&range=90d',
  };
}

export function getClientHint(t: Translate, myRequestsCount: number, myOpenRequestsCount: number): HintContent {
  if (myRequestsCount === 0) {
    return {
      text: t(I18N_KEYS.requestsPage.clientHintNoRequestsText),
      ctaLabel: t(I18N_KEYS.requestsPage.clientHintNoRequestsCta),
      ctaHref: '/request/create',
    };
  }
  if (myOpenRequestsCount > 0) {
    return {
      text: t(I18N_KEYS.requestsPage.clientHintHasOpenText),
      ctaLabel: t(I18N_KEYS.requestsPage.clientHintHasOpenCta),
      ctaHref: '/workspace?section=requests&scope=my&period=90d&range=90d',
    };
  }
  return {
    text: t(I18N_KEYS.requestsPage.clientHintStableText),
    ctaLabel: t(I18N_KEYS.requestsPage.clientHintStableCta),
    ctaHref: '/request/create',
  };
}
