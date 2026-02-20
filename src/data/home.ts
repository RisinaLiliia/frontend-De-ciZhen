import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';

export const HOME_CATEGORIES: Array<{ key: string; labelKey: I18nKey }> = [
  { key: 'cleaning', labelKey: I18N_KEYS.homePublic.serviceCleaning },
  { key: 'electric', labelKey: I18N_KEYS.homePublic.serviceElectric },
  { key: 'plumbing', labelKey: I18N_KEYS.homePublic.servicePlumbing },
  { key: 'repair', labelKey: I18N_KEYS.homePublic.serviceRepair },
  { key: 'moving', labelKey: I18N_KEYS.homePublic.serviceMoving },
];

export const HOME_SERVICES: Array<{
  key: string;
  href: string;
  labelKey: I18nKey;
  imageSrc: string;
}> = [
  {
    key: 'cleaning',
    href: '/requests',
    labelKey: I18N_KEYS.homePublic.serviceCleaning,
    imageSrc: '/Reinigung im modernen Wohnzimmer.jpg',
  },
  {
    key: 'electric',
    href: '/requests',
    labelKey: I18N_KEYS.homePublic.serviceElectric,
    imageSrc: '/Elektriker bei der Arbeit an Schaltschrank.jpg',
  },
  {
    key: 'plumbing',
    href: '/requests',
    labelKey: I18N_KEYS.homePublic.servicePlumbing,
    imageSrc: '/Freundlicher Klempner bei der Arbeit.jpg',
  },
  {
    key: 'repair',
    href: '/requests',
    labelKey: I18N_KEYS.homePublic.serviceRepair,
    imageSrc: '/Techniker repariert Smartphone in Werkstatt.jpg',
  },
  {
    key: 'moving',
    href: '/requests',
    labelKey: I18N_KEYS.homePublic.serviceMoving,
    imageSrc: '/L%C3%A4dt%20Kisten%20aus%20einem%20Transporter.jpg',
  },
];

export const HOME_PROOF_CASES: Array<{
  id: string;
  titleKey: I18nKey;
  infoKey: I18nKey;
  reviewKey: I18nKey;
  priceKey: I18nKey;
  rating: string;
}> = [
  {
    id: 'case-1',
    titleKey: I18N_KEYS.homePublic.proofCase1Title,
    infoKey: I18N_KEYS.homePublic.proofCase1Info,
    reviewKey: I18N_KEYS.homePublic.proofCase1Meta,
    priceKey: I18N_KEYS.homePublic.proofCase1Price,
    rating: '5.0',
  },
  {
    id: 'case-2',
    titleKey: I18N_KEYS.homePublic.proofCase2Title,
    infoKey: I18N_KEYS.homePublic.proofCase2Info,
    reviewKey: I18N_KEYS.homePublic.proofCase2Meta,
    priceKey: I18N_KEYS.homePublic.proofCase2Price,
    rating: '4.9',
  },
  {
    id: 'case-3',
    titleKey: I18N_KEYS.homePublic.proofCase3Title,
    infoKey: I18N_KEYS.homePublic.proofCase3Info,
    reviewKey: I18N_KEYS.homePublic.proofCase3Meta,
    priceKey: I18N_KEYS.homePublic.proofCase3Price,
    rating: '4.8',
  },
  {
    id: 'case-4',
    titleKey: I18N_KEYS.homePublic.proofCase4Title,
    infoKey: I18N_KEYS.homePublic.proofCase4Info,
    reviewKey: I18N_KEYS.homePublic.proofCase4Meta,
    priceKey: I18N_KEYS.homePublic.proofCase4Price,
    rating: '4.9',
  },
];


export const HOME_TOP_PROVIDERS: Array<{
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
}> = [
  {
    id: 'provider-1',
    badgeKeys: [I18N_KEYS.homePublic.topProvider1Badge1],
    status: 'online',
    statusLabelKey: I18N_KEYS.homePublic.topProviderStatus,
    avatarLetter: 'A',
    nameKey: I18N_KEYS.homePublic.topProvider1Name,
    roleKey: I18N_KEYS.homePublic.topProvider1Role,
    ratingKey: I18N_KEYS.homePublic.topProvider1Rating,
    responseMinutes: 12,
    reviewsCount: 128,
    ctaKey: I18N_KEYS.homePublic.topProvider1Cta,
    profileHref: '/providers/1',
    reviewsHref: '/providers/1#reviews',
  },
  {
    id: 'provider-2',
    badgeKeys: [I18N_KEYS.homePublic.topProvider2Badge1],
    status: 'offline',
    statusLabelKey: I18N_KEYS.homePublic.topProviderStatusOffline,
    avatarLetter: 'M',
    nameKey: I18N_KEYS.homePublic.topProvider2Name,
    roleKey: I18N_KEYS.homePublic.topProvider2Role,
    ratingKey: I18N_KEYS.homePublic.topProvider2Rating,
    responseMinutes: 19,
    reviewsCount: 96,
    ctaKey: I18N_KEYS.homePublic.topProvider2Cta,
    profileHref: '/providers/2',
    reviewsHref: '/providers/2#reviews',
  },
  {
    id: 'provider-3',
    badgeKeys: [I18N_KEYS.homePublic.topProvider3Badge1],
    status: 'online',
    statusLabelKey: I18N_KEYS.homePublic.topProviderStatus,
    avatarLetter: 'S',
    nameKey: I18N_KEYS.homePublic.topProvider3Name,
    roleKey: I18N_KEYS.homePublic.topProvider3Role,
    ratingKey: I18N_KEYS.homePublic.topProvider3Rating,
    responseMinutes: 15,
    reviewsCount: 142,
    ctaKey: I18N_KEYS.homePublic.topProvider3Cta,
    profileHref: '/providers/3',
    reviewsHref: '/providers/3#reviews',
  },
  {
    id: 'provider-4',
    badgeKeys: [I18N_KEYS.homePublic.topProvider4Badge1],
    status: 'offline',
    statusLabelKey: I18N_KEYS.homePublic.topProviderStatusOffline,
    avatarLetter: 'L',
    nameKey: I18N_KEYS.homePublic.topProvider4Name,
    roleKey: I18N_KEYS.homePublic.topProvider4Role,
    ratingKey: I18N_KEYS.homePublic.topProvider4Rating,
    responseMinutes: 24,
    reviewsCount: 87,
    ctaKey: I18N_KEYS.homePublic.topProvider4Cta,
    profileHref: '/providers/4',
    reviewsHref: '/providers/4#reviews',
  },
];
