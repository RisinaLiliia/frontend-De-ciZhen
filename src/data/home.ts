import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';

export const HOME_CATEGORIES: Array<{ key: string; labelKey: I18nKey }> = [
  { key: 'cleaning', labelKey: I18N_KEYS.homePublic.serviceCleaning },
  { key: 'electric', labelKey: I18N_KEYS.homePublic.serviceElectric },
  { key: 'plumbing', labelKey: I18N_KEYS.homePublic.servicePlumbing },
  { key: 'repair', labelKey: I18N_KEYS.homePublic.serviceRepair },
  { key: 'moving', labelKey: I18N_KEYS.homePublic.serviceMoving },
  { key: 'assembly', labelKey: I18N_KEYS.homePublic.serviceAssembly },
];

export const HOME_SERVICES: Array<{
  key: string;
  href: string;
  labelKey: I18nKey;
  imageSrc: string;
}> = [
  {
    key: 'cleaning',
    href: '/workspace?section=orders',
    labelKey: I18N_KEYS.homePublic.serviceCleaning,
    imageSrc: '/Reinigung im modernen Wohnzimmer.jpg',
  },
  {
    key: 'electric',
    href: '/workspace?section=orders',
    labelKey: I18N_KEYS.homePublic.serviceElectric,
    imageSrc: '/Elektriker bei der Arbeit an Schaltschrank.jpg',
  },
  {
    key: 'plumbing',
    href: '/workspace?section=orders',
    labelKey: I18N_KEYS.homePublic.servicePlumbing,
    imageSrc: '/Freundlicher Klempner bei der Arbeit.jpg',
  },
  {
    key: 'repair',
    href: '/workspace?section=orders',
    labelKey: I18N_KEYS.homePublic.serviceRepair,
    imageSrc: '/Techniker repariert Smartphone in Werkstatt.jpg',
  },
  {
    key: 'moving',
    href: '/workspace?section=orders',
    labelKey: I18N_KEYS.homePublic.serviceMoving,
    imageSrc: '/L%C3%A4dt%20Kisten%20aus%20einem%20Transporter.jpg',
  },
  {
    key: 'assembly',
    href: '/workspace?section=orders',
    labelKey: I18N_KEYS.homePublic.serviceAssembly,
    imageSrc: '/Techniker repariert Smartphone in Werkstatt.jpg',
  },
];

export const HOME_PROOF_CASES: Array<{
  id: string;
  titleKey: I18nKey;
  infoKey: I18nKey;
  reviewKey: I18nKey;
  priceKey: I18nKey;
  rating: string;
  publishedAt: string;
}> = [
  {
    id: 'case-1',
    titleKey: I18N_KEYS.homePublic.proofCase1Title,
    infoKey: I18N_KEYS.homePublic.proofCase1Info,
    reviewKey: I18N_KEYS.homePublic.proofCase1Meta,
    priceKey: I18N_KEYS.homePublic.proofCase1Price,
    rating: '5.0',
    publishedAt: '2026-02-19T10:12:00Z',
  },
  {
    id: 'case-2',
    titleKey: I18N_KEYS.homePublic.proofCase2Title,
    infoKey: I18N_KEYS.homePublic.proofCase2Info,
    reviewKey: I18N_KEYS.homePublic.proofCase2Meta,
    priceKey: I18N_KEYS.homePublic.proofCase2Price,
    rating: '4.9',
    publishedAt: '2026-02-18T14:40:00Z',
  },
  {
    id: 'case-3',
    titleKey: I18N_KEYS.homePublic.proofCase3Title,
    infoKey: I18N_KEYS.homePublic.proofCase3Info,
    reviewKey: I18N_KEYS.homePublic.proofCase3Meta,
    priceKey: I18N_KEYS.homePublic.proofCase3Price,
    rating: '4.8',
    publishedAt: '2026-02-17T09:08:00Z',
  },
  {
    id: 'case-4',
    titleKey: I18N_KEYS.homePublic.proofCase4Title,
    infoKey: I18N_KEYS.homePublic.proofCase4Info,
    reviewKey: I18N_KEYS.homePublic.proofCase4Meta,
    priceKey: I18N_KEYS.homePublic.proofCase4Price,
    rating: '4.9',
    publishedAt: '2026-02-16T18:22:00Z',
  },
  {
    id: 'case-5',
    titleKey: I18N_KEYS.homePublic.proofCase5Title,
    infoKey: I18N_KEYS.homePublic.proofCase5Info,
    reviewKey: I18N_KEYS.homePublic.proofCase5Meta,
    priceKey: I18N_KEYS.homePublic.proofCase5Price,
    rating: '4.9',
    publishedAt: '2026-02-15T07:35:00Z',
  },
  {
    id: 'case-6',
    titleKey: I18N_KEYS.homePublic.proofCase6Title,
    infoKey: I18N_KEYS.homePublic.proofCase6Info,
    reviewKey: I18N_KEYS.homePublic.proofCase6Meta,
    priceKey: I18N_KEYS.homePublic.proofCase6Price,
    rating: '5.0',
    publishedAt: '2026-02-14T16:05:00Z',
  },
  {
    id: 'case-7',
    titleKey: I18N_KEYS.homePublic.proofCase7Title,
    infoKey: I18N_KEYS.homePublic.proofCase7Info,
    reviewKey: I18N_KEYS.homePublic.proofCase7Meta,
    priceKey: I18N_KEYS.homePublic.proofCase7Price,
    rating: '4.8',
    publishedAt: '2026-02-13T11:52:00Z',
  },
  {
    id: 'case-8',
    titleKey: I18N_KEYS.homePublic.proofCase8Title,
    infoKey: I18N_KEYS.homePublic.proofCase8Info,
    reviewKey: I18N_KEYS.homePublic.proofCase8Meta,
    priceKey: I18N_KEYS.homePublic.proofCase8Price,
    rating: '4.9',
    publishedAt: '2026-02-12T19:10:00Z',
  },
  {
    id: 'case-9',
    titleKey: I18N_KEYS.homePublic.proofCase9Title,
    infoKey: I18N_KEYS.homePublic.proofCase9Info,
    reviewKey: I18N_KEYS.homePublic.proofCase9Meta,
    priceKey: I18N_KEYS.homePublic.proofCase9Price,
    rating: '4.8',
    publishedAt: '2026-02-11T08:25:00Z',
  },
  {
    id: 'case-10',
    titleKey: I18N_KEYS.homePublic.proofCase10Title,
    infoKey: I18N_KEYS.homePublic.proofCase10Info,
    reviewKey: I18N_KEYS.homePublic.proofCase10Meta,
    priceKey: I18N_KEYS.homePublic.proofCase10Price,
    rating: '4.9',
    publishedAt: '2026-02-10T13:18:00Z',
  },
  {
    id: 'case-11',
    titleKey: I18N_KEYS.homePublic.proofCase11Title,
    infoKey: I18N_KEYS.homePublic.proofCase11Info,
    reviewKey: I18N_KEYS.homePublic.proofCase11Meta,
    priceKey: I18N_KEYS.homePublic.proofCase11Price,
    rating: '4.8',
    publishedAt: '2026-02-09T15:47:00Z',
  },
  {
    id: 'case-12',
    titleKey: I18N_KEYS.homePublic.proofCase12Title,
    infoKey: I18N_KEYS.homePublic.proofCase12Info,
    reviewKey: I18N_KEYS.homePublic.proofCase12Meta,
    priceKey: I18N_KEYS.homePublic.proofCase12Price,
    rating: '4.9',
    publishedAt: '2026-02-08T12:03:00Z',
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
  cityKey: I18nKey;
  aboutKey: I18nKey;
  ratingKey: I18nKey;
  reviewKey: I18nKey;
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
    cityKey: I18N_KEYS.homePublic.topProvider1City,
    aboutKey: I18N_KEYS.homePublic.topProvider1About,
    ratingKey: I18N_KEYS.homePublic.topProvider1Rating,
    reviewKey: I18N_KEYS.homePublic.topProvider1Review,
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
    cityKey: I18N_KEYS.homePublic.topProvider2City,
    aboutKey: I18N_KEYS.homePublic.topProvider2About,
    ratingKey: I18N_KEYS.homePublic.topProvider2Rating,
    reviewKey: I18N_KEYS.homePublic.topProvider2Review,
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
    cityKey: I18N_KEYS.homePublic.topProvider3City,
    aboutKey: I18N_KEYS.homePublic.topProvider3About,
    ratingKey: I18N_KEYS.homePublic.topProvider3Rating,
    reviewKey: I18N_KEYS.homePublic.topProvider3Review,
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
    cityKey: I18N_KEYS.homePublic.topProvider4City,
    aboutKey: I18N_KEYS.homePublic.topProvider4About,
    ratingKey: I18N_KEYS.homePublic.topProvider4Rating,
    reviewKey: I18N_KEYS.homePublic.topProvider4Review,
    responseMinutes: 24,
    reviewsCount: 87,
    ctaKey: I18N_KEYS.homePublic.topProvider4Cta,
    profileHref: '/providers/4',
    reviewsHref: '/providers/4#reviews',
  },
  {
    id: 'provider-5',
    badgeKeys: [I18N_KEYS.homePublic.topProvider5Badge1],
    status: 'online',
    statusLabelKey: I18N_KEYS.homePublic.topProviderStatus,
    avatarLetter: 'N',
    nameKey: I18N_KEYS.homePublic.topProvider5Name,
    roleKey: I18N_KEYS.homePublic.topProvider5Role,
    cityKey: I18N_KEYS.homePublic.topProvider5City,
    aboutKey: I18N_KEYS.homePublic.topProvider5About,
    ratingKey: I18N_KEYS.homePublic.topProvider5Rating,
    reviewKey: I18N_KEYS.homePublic.topProvider5Review,
    responseMinutes: 18,
    reviewsCount: 104,
    ctaKey: I18N_KEYS.homePublic.topProvider5Cta,
    profileHref: '/providers/5',
    reviewsHref: '/providers/5#reviews',
  },
];
