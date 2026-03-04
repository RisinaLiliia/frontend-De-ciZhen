'use client';

import { IconBriefcase, IconCheck, IconUser } from '@/components/ui/icons/icons';
import type { PersonalNavItem } from '@/components/layout/PersonalNavSection';
import type { WorkspacePrivateOverviewDto } from '@/lib/api/dto/workspace';
import type { I18nKey } from '@/lib/i18n/keys';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';

type Translator = (key: I18nKey) => string;

export type StatsPayload = {
  kpis: Array<{ key: string; label: string; value: string }>;
  showKpis?: boolean;
  hasData?: boolean;
  chartTitle: string;
  chartDelta?: string;
  chartPoints: Array<{ label: string; bars: number; line: number }>;
  secondary: {
    leftLabel: string;
    leftValue: string;
    centerLabel: string;
    centerValue: string;
    rightLabel: string;
    rightValue: string;
    progressLabel: string;
    progressValue: number;
    responseLabel: string;
    responseValue: string;
  };
  hint: { text: string; ctaLabel: string; ctaHref: string };
  emptyTitle: string;
  emptyCtaLabel: string;
  emptyCtaHref: string;
};

type BuildPublicNavItemsArgs = {
  t: Translator;
  formatNumber: Intl.NumberFormat;
  publicRequestsCount: number;
  publicProvidersCount: number;
  publicStatsCount: number;
  activePublicSection: PublicWorkspaceSection | null;
  markPublicRequestsSeen: () => void;
};

export function buildPublicNavItems({
  t,
  formatNumber,
  publicRequestsCount,
  publicProvidersCount,
  publicStatsCount,
  activePublicSection,
  markPublicRequestsSeen,
}: BuildPublicNavItemsArgs): PersonalNavItem[] {
  return [
    {
      key: 'public-requests',
      href: '/workspace?section=requests',
      label: t(I18N_KEYS.homePublic.exploreAllOrders),
      icon: <IconBriefcase />,
      value: formatNumber.format(publicRequestsCount),
      hint: t(I18N_KEYS.requestsPage.resultsLabel),
      onClick: markPublicRequestsSeen,
      forceActive: activePublicSection === 'requests',
    },
    {
      key: 'public-providers',
      href: '/workspace?section=providers',
      label: t(I18N_KEYS.homePublic.exploreAllProviders),
      icon: <IconUser />,
      value: formatNumber.format(publicProvidersCount),
      hint: t(I18N_KEYS.requestsPage.heroProviderPrimaryCta),
      forceActive: activePublicSection === 'providers',
    },
    {
      key: 'public-stats',
      href: '/workspace?section=stats',
      label: t(I18N_KEYS.homePublic.exploreStats),
      icon: <IconCheck />,
      value: formatNumber.format(publicStatsCount),
      hint: t(I18N_KEYS.homePublic.activitySubtitle),
      forceActive: activePublicSection === 'stats',
    },
  ];
}

export function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function mapMonthlySeries(
  series: WorkspacePrivateOverviewDto['providerMonthlySeries'] | undefined,
  chartMonthLabel: Intl.DateTimeFormat,
) {
  return (series ?? []).map((point) => {
    const ts = new Date(point.monthStart);
    return {
      label: Number.isFinite(ts.getTime()) ? chartMonthLabel.format(ts) : point.monthStart.slice(0, 7),
      bars: Math.max(0, point.bars),
      line: Math.max(0, point.line),
    };
  });
}
