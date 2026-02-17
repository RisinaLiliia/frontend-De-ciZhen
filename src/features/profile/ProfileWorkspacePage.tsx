'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { listMyRequests } from '@/lib/api/requests';
import { acceptOffer, declineOffer, listMyProviderOffers, listMyClientOffers } from '@/lib/api/offers';
import { listMyContracts } from '@/lib/api/contracts';
import { createThread, listInbox } from '@/lib/api/chat';
import { listFavorites } from '@/lib/api/favorites';
import { listPublicProviders } from '@/lib/api/providers';
import { updateMe, uploadMyAvatar } from '@/lib/api/users';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { OfferDto } from '@/lib/api/dto/offers';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import { useAuthMe, useHasProviderProfile } from '@/hooks/useAuthSnapshot';
import { useAuthStore } from '@/features/auth/store';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { UserHeaderCard } from '@/components/ui/UserHeaderCard';
import { RatingSummary } from '@/components/ui/RatingSummary';
import { OfferActionButton } from '@/components/ui/OfferActionButton';

type WorkspaceTab = 'requests' | 'offers' | 'contracts' | 'chat' | 'favorites' | 'settings';
const WORKSPACE_TABS: WorkspaceTab[] = ['requests', 'offers', 'contracts', 'chat', 'favorites', 'settings'];

function isWorkspaceTab(value: string | null): value is WorkspaceTab {
  return Boolean(value && WORKSPACE_TABS.includes(value as WorkspaceTab));
}

async function with403Fallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof Error && 'status' in error) {
      const status = Number((error as { status?: number }).status ?? 0);
      if (status === 403 || status === 404) return fallback;
    }
    throw error;
  }
}

export default function ProfileWorkspacePage() {
  const t = useT();
  const authMe = useAuthMe();
  const hasProviderProfile = useHasProviderProfile();
  const setMe = useAuthStore((s) => s.setMe);
  const { locale, setLocale } = useI18n();
  const { resolvedTheme, setTheme } = useTheme();
  const qc = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = React.useState<WorkspaceTab>('requests');
  const [offersDrawerRequest, setOffersDrawerRequest] = React.useState<RequestResponseDto | null>(null);
  const [providerDrawerOffer, setProviderDrawerOffer] = React.useState<OfferDto | null>(null);
  const [pendingOfferId, setPendingOfferId] = React.useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);
  const [isSavingBio, setIsSavingBio] = React.useState(false);
  const [isBioEditing, setIsBioEditing] = React.useState(false);
  const [bioDraft, setBioDraft] = React.useState('');
  const [profileForm, setProfileForm] = React.useState({
    name: '',
    city: '',
    phone: '',
  });

  const { data: myRequests = [], isLoading: isRequestsLoading } = useQuery({
    queryKey: ['requests-my'],
    queryFn: () => with403Fallback(() => listMyRequests(), []),
  });
  const { data: providerOffers = [] } = useQuery({
    queryKey: ['offers-my'],
    queryFn: () => with403Fallback(() => listMyProviderOffers(), []),
  });
  const { data: clientOffers = [] } = useQuery({
    queryKey: ['offers-my-client'],
    queryFn: () => with403Fallback(() => listMyClientOffers(), []),
  });
  const { data: contracts = [] } = useQuery({
    queryKey: ['contracts-my-all'],
    queryFn: () => with403Fallback(() => listMyContracts({ role: 'all' }), []),
  });
  const { data: inbox = [] } = useQuery({
    queryKey: ['chat-inbox', 'all'],
    queryFn: () => with403Fallback(() => listInbox('all'), []),
  });
  const { data: favoriteRequests = [] } = useQuery({
    queryKey: ['favorite-requests'],
    queryFn: () => with403Fallback(() => listFavorites('request'), []),
  });
  const { data: favoriteProviders = [] } = useQuery({
    queryKey: ['favorite-providers'],
    queryFn: () => with403Fallback(() => listFavorites('provider'), []),
  });
  const selectedProviderUserId = providerDrawerOffer?.providerUserId ?? null;
  const { data: selectedProvider } = useQuery({
    queryKey: ['provider-public', selectedProviderUserId],
    enabled: Boolean(selectedProviderUserId),
    queryFn: async () => {
      const list = await listPublicProviders();
      return list.find((item) => item.id === selectedProviderUserId) ?? null;
    },
  });
  const { data: myProviderPublic } = useQuery({
    queryKey: ['provider-public-self', authMe?.id],
    enabled: Boolean(authMe?.id),
    queryFn: async () => {
      const list = await listPublicProviders();
      return list.find((item) => item.id === authMe?.id) ?? null;
    },
  });

  const offersByRequest = React.useMemo(() => {
    const map = new Map<string, OfferDto[]>();
    clientOffers.forEach((offer) => {
      const current = map.get(offer.requestId) ?? [];
      current.push(offer);
      map.set(offer.requestId, current);
    });
    map.forEach((value, key) => {
      const sorted = [...value].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
      map.set(key, sorted);
    });
    return map;
  }, [clientOffers]);

  const offerStatusLabel = (status: OfferDto['status']) => {
    if (status === 'accepted') return t(I18N_KEYS.offers.accepted);
    if (status === 'declined') return t(I18N_KEYS.requestDetails.statusDeclined);
    if (status === 'withdrawn') return 'Withdrawn';
    return status;
  };

  const requestStatusLabel = (status: RequestResponseDto['status'], offersCount: number) => {
    if (status === 'cancelled') return 'cancelled';
    if (status === 'closed') return 'completed';
    if (status === 'matched') return 'assigned';
    if (status === 'published' && offersCount > 0) return 'has_offers';
    return 'open';
  };

  const handleAccept = async (offerId: string) => {
    setPendingOfferId(offerId);
    try {
      await acceptOffer(offerId);
      toast.success(t(I18N_KEYS.offers.accepted));
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['offers-my-client'] }),
        qc.invalidateQueries({ queryKey: ['requests-my'] }),
        qc.invalidateQueries({ queryKey: ['contracts-my-all'] }),
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    } finally {
      setPendingOfferId(null);
    }
  };

  const handleDecline = async (offerId: string) => {
    setPendingOfferId(offerId);
    try {
      await declineOffer(offerId);
      toast.success(t(I18N_KEYS.requestDetails.statusDeclined));
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['offers-my-client'] }),
        qc.invalidateQueries({ queryKey: ['requests-my'] }),
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    } finally {
      setPendingOfferId(null);
    }
  };

  const handleChat = async (offer: OfferDto) => {
    try {
      const thread = await createThread({
        requestId: offer.requestId,
        providerUserId: offer.providerUserId,
        offerId: offer.id,
      });
      router.push(`/chat/${thread.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    }
  };

  const offersTotal = providerOffers.length + clientOffers.length;
  const unreadTotal = inbox.reduce(
    (sum, thread) => sum + (thread.unreadClientCount || 0) + (thread.unreadProviderCount || 0),
    0,
  );
  const favoritesTotal = favoriteRequests.length + favoriteProviders.length;
  const avatarUrl = authMe?.avatar?.url?.trim() || null;
  const profileDescription = bioDraft.trim();
  const ratingValue = myProviderPublic?.ratingAvg?.toFixed(1) ?? '—';
  const reviewCount = myProviderPublic?.ratingCount ?? 0;
  const dominantStats = React.useMemo(
    () => ({
      requestsCreated: myRequests.length,
      offersSent: providerOffers.length,
      contractsAsProvider: contracts.filter((item) => item.providerUserId === authMe?.id).length,
    }),
    [authMe?.id, contracts, myRequests.length, providerOffers.length],
  );

  React.useEffect(() => {
    setProfileForm({
      name: authMe?.name ?? '',
      city: authMe?.city ?? '',
      phone: authMe?.phone ?? '',
    });
    setBioDraft(authMe?.bio ?? '');
    setIsBioEditing(false);
  }, [authMe?.name, authMe?.city, authMe?.phone, authMe?.bio]);

  React.useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (!isWorkspaceTab(tabFromUrl)) return;
    setActiveTab((prev) => (prev === tabFromUrl ? prev : tabFromUrl));
  }, [searchParams]);

  const setWorkspaceTab = React.useCallback(
    (tab: WorkspaceTab) => {
      setActiveTab(tab);
      const next = new URLSearchParams(searchParams.toString());
      next.set('tab', tab);
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handleSaveProfile = async () => {
    const name = profileForm.name.trim();
    if (name.length < 2) {
      toast.error('Name muss mindestens 2 Zeichen haben');
      return;
    }

    setIsSavingProfile(true);
    try {
      const updated = await updateMe({
        name,
        city: profileForm.city.trim(),
        phone: profileForm.phone.trim(),
      });
      setMe(updated);
      toast.success('Profil aktualisiert');
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveBio = async () => {
    setIsSavingBio(true);
    try {
      const updated = await updateMe({
        bio: bioDraft.trim(),
      });
      setMe(updated);
      setIsBioEditing(false);
      toast.success('Beschreibung aktualisiert');
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    } finally {
      setIsSavingBio(false);
    }
  };

  const handleAvatarSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const updated = await uploadMyAvatar(file);
      setMe(updated);
      toast.success('Profilfoto aktualisiert');
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = '';
    }
  };

  const tabs: Array<{ key: WorkspaceTab; label: string; count?: number }> = [
    { key: 'requests', label: t(I18N_KEYS.client.requestsTitle), count: myRequests.length },
    { key: 'offers', label: t(I18N_KEYS.requestsPage.navMyOffers), count: offersTotal },
    { key: 'contracts', label: t(I18N_KEYS.client.contractsTitle), count: contracts.length },
    { key: 'chat', label: t(I18N_KEYS.chat.inboxTitle), count: unreadTotal },
    { key: 'favorites', label: 'Favoriten', count: favoritesTotal },
    { key: 'settings', label: t(I18N_KEYS.client.settingsTitle) },
  ];

  return (
    <PageShell right={<AuthActions />} withSpacer={false}>
      <section className="card stack-sm">
        <UserHeaderCard
          name={authMe?.name || t(I18N_KEYS.auth.profileLabel)}
          avatarUrl={avatarUrl}
          stats={dominantStats}
          hasProviderProfile={hasProviderProfile}
          adaptiveDesktop
          rating={ratingValue}
          reviewsCount={reviewCount}
          reviewsLabel={t(I18N_KEYS.requestDetails.clientReviews)}
        />

        <article className="profile-bio">
          <header className="profile-bio__head">
            <div className="profile-bio__title-wrap">
              <p className="profile-bio__label">Beschreibung</p>
            </div>
            <span className="count-badge count-badge--sm">{profileDescription.length}/2000</span>
          </header>

          <textarea
            className={`input profile-bio__textarea ${isBioEditing ? '' : 'profile-bio__textarea--readonly'}`.trim()}
            value={bioDraft}
            onChange={(event) =>
              setBioDraft(event.target.value)
            }
            maxLength={2000}
            placeholder="Erzaehle kurz ueber dich, deine Erfahrung oder Arbeitsweise."
            readOnly={!isBioEditing}
          />

          <div className="profile-bio__footer">
            <p className="profile-bio__hint">
              {profileDescription
                ? 'Aendere den Text jederzeit und speichere die neue Version.'
                : 'Dieses Feld kann jederzeit bearbeitet und gespeichert werden.'}
            </p>
            {isBioEditing ? (
              <div className="profile-bio__actions">
                <button
                  type="button"
                  className="btn-ghost profile-bio__action"
                  onClick={() => {
                    setBioDraft(authMe?.bio ?? '');
                    setIsBioEditing(false);
                  }}
                  disabled={isSavingBio}
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  className="btn-primary profile-bio__action"
                  onClick={() => {
                    void handleSaveBio();
                  }}
                  disabled={isSavingBio}
                >
                  {isSavingBio ? t(I18N_KEYS.common.refreshing) : 'Speichern'}
                </button>
              </div>
            ) : (
              <OfferActionButton
                kind="edit"
                label="Beschreibung bearbeiten"
                ariaLabel="Beschreibung bearbeiten"
                title="Beschreibung bearbeiten"
                iconOnly
                className="request-card__status-action request-card__status-action--edit profile-bio__save-icon"
                onClick={() => setIsBioEditing(true)}
              />
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`card stack-xs text-left transition ${
              activeTab === tab.key
                ? 'border-[var(--c-primary)] shadow-[0_0_0_2px_color-mix(in_oklab,var(--c-primary)_25%,transparent)]'
                : ''
            }`.trim()}
            onClick={() => setWorkspaceTab(tab.key)}
          >
            <p className="typo-small">{tab.label}</p>
            <p className="typo-h3">{tab.count ?? '—'}</p>
          </button>
        ))}
      </section>

      <section className="card stack-sm">
        {activeTab === 'requests' ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <h2 className="typo-h3">{t(I18N_KEYS.client.requestsTitle)}</h2>
            </div>
            {isRequestsLoading ? <p className="typo-muted">{t(I18N_KEYS.common.refreshing)}</p> : null}
            <div className="stack-sm">
              {myRequests.map((item) => {
                const requestOffers = offersByRequest.get(item.id) ?? [];
                return (
                  <article key={item.id} className="rounded-xl border border-[var(--c-border)] p-3 stack-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{item.title || item.serviceKey}</p>
                        <p className="typo-small">
                          {item.propertyType} · {item.area} m² · {item.cityName || item.cityId}
                        </p>
                        <p className="typo-small">{new Date(item.preferredDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="badge">{requestStatusLabel(item.status, requestOffers.length)}</span>
                        <p className="typo-small">
                          {t(I18N_KEYS.client.responsesLabel)}: {requestOffers.length}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" className="badge" onClick={() => setOffersDrawerRequest(item)}>
                        {t(I18N_KEYS.client.viewOffersCta)}
                      </button>
                      <Link href={`/requests/${item.id}`} className="badge">
                        {t(I18N_KEYS.requestsPage.detailsCta)}
                      </Link>
                    </div>
                  </article>
                );
              })}
              {myRequests.length === 0 ? <p className="typo-muted">{t(I18N_KEYS.client.requestsEmpty)}</p> : null}
            </div>
          </>
        ) : null}

        {activeTab === 'offers' ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <h2 className="typo-h3">{t(I18N_KEYS.requestsPage.navMyOffers)}</h2>
              <div className="flex gap-2">
                <Link href="/client/offers" className="badge">
                  {t(I18N_KEYS.client.offersTitle)}
                </Link>
                <Link href="/requests" className="badge">
                  {t(I18N_KEYS.requestsPage.title)}
                </Link>
              </div>
            </div>
            <p className="typo-small">
              {t(I18N_KEYS.client.offersTitle)}: {clientOffers.length} · {t(I18N_KEYS.provider.myResponsesTitle)}:{' '}
              {providerOffers.length}
            </p>
          </>
        ) : null}

        {activeTab === 'contracts' ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <h2 className="typo-h3">{t(I18N_KEYS.client.contractsTitle)}</h2>
              <div className="flex gap-2">
                <Link href="/client/contracts" className="badge">
                  Client
                </Link>
                <Link href="/provider/contracts" className="badge">
                  Provider
                </Link>
              </div>
            </div>
            <p className="typo-small">{contracts.length} contracts</p>
          </>
        ) : null}

        {activeTab === 'chat' ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <h2 className="typo-h3">{t(I18N_KEYS.chat.inboxTitle)}</h2>
              <Link href="/chat" className="badge">
                {t(I18N_KEYS.client.viewAll)}
              </Link>
            </div>
            <p className="typo-small">Unread: {unreadTotal}</p>
          </>
        ) : null}

        {activeTab === 'favorites' ? (
          <>
            <h2 className="typo-h3">Favoriten</h2>
            <p className="typo-small">
              Requests: {favoriteRequests.length} · Providers: {favoriteProviders.length}
            </p>
            <Link href="/requests" className="badge">
              {t(I18N_KEYS.requestsPage.title)}
            </Link>
          </>
        ) : null}

        {activeTab === 'settings' ? (
          <>
            <h2 className="typo-h3">{t(I18N_KEYS.client.settingsTitle)}</h2>
            <p className="typo-small">Kontodaten, Sicherheit und App-Einstellungen</p>

            <div className="grid gap-3 lg:grid-cols-2">
              <article className="rounded-xl border border-[var(--c-border)] p-3 stack-sm">
                <p className="text-sm font-semibold">Persoenliche Daten</p>
                <label className="stack-xs">
                  <span className="typo-small">{t(I18N_KEYS.auth.nameLabel)}</span>
                  <input
                    className="input"
                    value={profileForm.name}
                    onChange={(event) =>
                      setProfileForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                  />
                </label>
                <label className="stack-xs">
                  <span className="typo-small">{t(I18N_KEYS.auth.cityLabel)}</span>
                  <input
                    className="input"
                    value={profileForm.city}
                    onChange={(event) =>
                      setProfileForm((prev) => ({ ...prev, city: event.target.value }))
                    }
                  />
                </label>
                <label className="stack-xs">
                  <span className="typo-small">Telefon</span>
                  <input
                    className="input"
                    value={profileForm.phone}
                    onChange={(event) =>
                      setProfileForm((prev) => ({ ...prev, phone: event.target.value }))
                    }
                  />
                </label>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    void handleSaveProfile();
                  }}
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? t(I18N_KEYS.common.refreshing) : 'Speichern'}
                </button>
              </article>

              <article className="rounded-xl border border-[var(--c-border)] p-3 stack-sm">
                <p className="text-sm font-semibold">Login und Sicherheit</p>
                <label className="stack-xs">
                  <span className="typo-small">Login</span>
                  <input className="input" value={authMe?.email ?? ''} disabled />
                </label>
                <label className="stack-xs">
                  <span className="typo-small">{t(I18N_KEYS.auth.passwordLabel)}</span>
                  <input className="input" value="••••••••" disabled />
                </label>
                <button type="button" className="btn-ghost" disabled>
                  Passwort ändern (API folgt)
                </button>
                <label className="stack-xs">
                  <span className="typo-small">Profilfoto</span>
                  <input
                    className="input"
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      void handleAvatarSelected(event);
                    }}
                    disabled={isUploadingAvatar}
                  />
                </label>
                <p className="typo-small">
                  {isUploadingAvatar ? 'Foto wird hochgeladen...' : 'JPG/PNG bis 10MB'}
                </p>
              </article>

              <article className="rounded-xl border border-[var(--c-border)] p-3 stack-sm">
                <p className="text-sm font-semibold">Darstellung</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`badge ${resolvedTheme === 'light' ? '' : 'btn-ghost'}`.trim()}
                    onClick={() => setTheme('light')}
                  >
                    Light
                  </button>
                  <button
                    type="button"
                    className={`badge ${resolvedTheme === 'dark' ? '' : 'btn-ghost'}`.trim()}
                    onClick={() => setTheme('dark')}
                  >
                    Dark
                  </button>
                </div>
              </article>

              <article className="rounded-xl border border-[var(--c-border)] p-3 stack-sm">
                <p className="text-sm font-semibold">Sprache</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`badge ${locale === 'de' ? '' : 'btn-ghost'}`.trim()}
                    onClick={() => setLocale('de')}
                  >
                    Deutsch
                  </button>
                  <button
                    type="button"
                    className={`badge ${locale === 'en' ? '' : 'btn-ghost'}`.trim()}
                    onClick={() => setLocale('en')}
                  >
                    English
                  </button>
                </div>
                <p className="typo-small">Aktuell: {locale.toUpperCase()}</p>
              </article>
            </div>
          </>
        ) : null}
      </section>

      {offersDrawerRequest ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            onClick={() => setOffersDrawerRequest(null)}
            aria-label="Close offers drawer"
          />
          <aside className="absolute right-0 top-0 h-full w-full max-w-xl border-l border-[var(--c-border)] bg-[var(--c-panel)] p-5 overflow-y-auto stack-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="typo-h3">{offersDrawerRequest.title || offersDrawerRequest.serviceKey}</h2>
                <p className="typo-small">{t(I18N_KEYS.client.responsesLabel)}</p>
              </div>
              <button type="button" className="btn-ghost" onClick={() => setOffersDrawerRequest(null)}>
                ×
              </button>
            </div>

            <div className="stack-sm">
              {(offersByRequest.get(offersDrawerRequest.id) ?? []).map((offer) => {
                const isPending = pendingOfferId === offer.id;
                const canDecide = offer.status === 'sent';
                return (
                  <div key={offer.id} className="rounded-xl border border-[var(--c-border)] p-3 stack-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {offer.providerDisplayName || t(I18N_KEYS.offers.unnamed)}
                        </p>
                        <RatingSummary
                          rating={offer.providerRatingAvg?.toFixed(1) ?? '—'}
                          reviewsCount={offer.providerRatingCount ?? 0}
                          reviewsLabel={t(I18N_KEYS.homePublic.reviews)}
                        />
                        <p className="typo-small">{t(I18N_KEYS.offers.jobs)}: {offer.providerCompletedJobs ?? '—'}</p>
                        {offer.message ? <p className="typo-small">{offer.message}</p> : null}
                      </div>
                      <span className="badge capitalize">{offerStatusLabel(offer.status)}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full border border-[var(--c-border)] px-2.5 py-1 text-xs">
                        {offer.amount ? `€ ${offer.amount}` : '€ —'}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-[var(--c-border)] px-2.5 py-1 text-xs">
                        {offer.availableAt ? new Date(offer.availableAt).toLocaleString() : 'Availability not set'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {canDecide ? (
                        <>
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={() => {
                              void handleAccept(offer.id);
                            }}
                            disabled={isPending}
                          >
                            {t(I18N_KEYS.offers.acceptCta)}
                          </button>
                          <button
                            type="button"
                            className="btn-ghost"
                            onClick={() => {
                              void handleDecline(offer.id);
                            }}
                            disabled={isPending}
                          >
                            {t(I18N_KEYS.offers.declineCta)}
                          </button>
                        </>
                      ) : null}
                      <button
                        type="button"
                        className="badge"
                        onClick={() => {
                          void handleChat(offer);
                        }}
                      >
                        {t(I18N_KEYS.offers.chatCta)}
                      </button>
                      <button type="button" className="badge" onClick={() => setProviderDrawerOffer(offer)}>
                        {t(I18N_KEYS.offers.profileCta)}
                      </button>
                    </div>
                  </div>
                );
              })}
              {(offersByRequest.get(offersDrawerRequest.id) ?? []).length === 0 ? (
                <p className="typo-muted">{t(I18N_KEYS.client.offersEmpty)}</p>
              ) : null}
            </div>
          </aside>
        </div>
      ) : null}

      {providerDrawerOffer ? (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            onClick={() => setProviderDrawerOffer(null)}
            aria-label="Close provider drawer"
          />
          <aside className="absolute right-0 top-0 h-full w-full max-w-md border-l border-[var(--c-border)] bg-[var(--c-panel)] p-5 overflow-y-auto stack-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="typo-h3">{providerDrawerOffer.providerDisplayName || t(I18N_KEYS.offers.unnamed)}</h2>
                <p className="typo-small">{t(I18N_KEYS.provider.profileTitle)}</p>
              </div>
              <button type="button" className="btn-ghost" onClick={() => setProviderDrawerOffer(null)}>
                ×
              </button>
            </div>

            <section className="card stack-sm">
              <RatingSummary
                rating={selectedProvider?.ratingAvg?.toFixed(1) ?? providerDrawerOffer.providerRatingAvg?.toFixed(1) ?? '—'}
                reviewsCount={selectedProvider?.ratingCount ?? providerDrawerOffer.providerRatingCount ?? 0}
                reviewsLabel={t(I18N_KEYS.homePublic.reviews)}
              />
              <p className="typo-small">
                {t(I18N_KEYS.offers.jobs)}: {selectedProvider?.completedJobs ?? providerDrawerOffer.providerCompletedJobs ?? '—'}
              </p>
              <p className="typo-small">
                {t(I18N_KEYS.provider.basePrice)}: {selectedProvider?.basePrice ? `€ ${selectedProvider.basePrice}` : '—'}
              </p>
            </section>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/providers/${providerDrawerOffer.providerUserId}`}
                className="btn-primary"
                onClick={() => setProviderDrawerOffer(null)}
              >
                {t(I18N_KEYS.offers.profileCta)}
              </Link>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  void handleChat(providerDrawerOffer);
                  setProviderDrawerOffer(null);
                }}
              >
                {t(I18N_KEYS.offers.chatCta)}
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </PageShell>
  );
}
