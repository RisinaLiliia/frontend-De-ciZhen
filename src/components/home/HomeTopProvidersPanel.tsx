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
  reviewsKey: I18nKey;
  ctaKey: I18nKey;
  profileHref: string;
  reviewsHref: string;
};

type HomeTopProvidersPanelProps = {
  t: (key: I18nKey) => string;
  providers: ReadonlyArray<ProviderItem>;
};

export function HomeTopProvidersPanel({ t, providers }: HomeTopProvidersPanelProps) {
  const mappedProviders = providers.map((provider) => ({
    ...(() => {
      const reviewsText = t(provider.reviewsKey).trim();
      const countMatch = reviewsText.match(/\d+/);
      const reviewsCount = countMatch ? Number(countMatch[0]) : 0;
      const reviewsLabel = reviewsText
        .replace(/\d+/g, '')
        .trim()
        .replace(/^\s+|\s+$/g, '');
      return {
        reviewsCount,
        reviewsLabel,
      };
    })(),
    id: provider.id,
    badges: provider.badgeKeys.map((badge) => t(badge)),
    status: provider.status,
    statusLabel: t(provider.statusLabelKey),
    avatarLetter: provider.avatarLetter,
    name: t(provider.nameKey),
    role: t(provider.roleKey),
    rating: t(provider.ratingKey),
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
