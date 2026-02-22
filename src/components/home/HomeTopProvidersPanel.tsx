/* src/components/home/HomeTopProvidersPanel.tsx */
import { I18N_KEYS } from '@/lib/i18n/keys';
import { TopProvidersPanel } from '@/components/providers/TopProvidersPanel';
import type { I18nKey } from '@/lib/i18n/keys';

type ProviderItem = {
  id: string;
  badgeKeys: I18nKey[];
  status: 'online' | 'offline';
  statusLabelKey: I18nKey;
  avatarLetter: string;
  nameKey: I18nKey;
  roleKey: I18nKey;
  ratingKey: I18nKey;
  responseMinutes: number;
  reviewsCount: number;
  ctaKey: I18nKey;
  profileHref: string;
  reviewsHref: string;
};

type HomeTopProvidersPanelProps = {
  t: (key: I18nKey) => string;
  providers: ReadonlyArray<ProviderItem>;
};

export function HomeTopProvidersPanel({ t, providers }: HomeTopProvidersPanelProps) {
  const reviewsLabel = t(I18N_KEYS.homePublic.reviews);
  const responseTimeLabel = t(I18N_KEYS.homePublic.topProviderResponseTimeLabel);
  const mappedProviders = providers.map((provider) => ({
    id: provider.id,
    badges: provider.badgeKeys.map((badge) => t(badge)),
    status: provider.status,
    statusLabel: t(provider.statusLabelKey),
    avatarLetter: provider.avatarLetter,
    name: t(provider.nameKey),
    role: t(provider.roleKey),
    rating: t(provider.ratingKey),
    responseTime: `~${provider.responseMinutes} ${t(I18N_KEYS.homePublic.statMinutes)}`,
    responseTimeLabel,
    reviewsCount: provider.reviewsCount,
    reviewsLabel,
    ctaLabel: t(provider.ctaKey),
    profileHref: provider.profileHref,
    reviewsHref: provider.reviewsHref,
  }));
  return (
    <TopProvidersPanel
      title={t(I18N_KEYS.homePublic.topProviders)}
      subtitle={t(I18N_KEYS.homePublic.topProvidersSubtitle)}
      ctaLabel={t(I18N_KEYS.homePublic.topProvidersCta)}
      ctaHref="/requests"
      providers={mappedProviders}
    />
  );
}
