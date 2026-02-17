'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { listMyRequests } from '@/lib/api/requests';
import { listMyProviderOffers, listMyClientOffers } from '@/lib/api/offers';
import { listMyContracts } from '@/lib/api/contracts';
import { listInbox } from '@/lib/api/chat';
import { listFavorites } from '@/lib/api/favorites';
import { listPublicProviders } from '@/lib/api/providers';
import { changeMyPassword, updateMe, uploadMyAvatar } from '@/lib/api/users';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useAuthMe, useHasProviderProfile } from '@/hooks/useAuthSnapshot';
import { useAuthStore } from '@/features/auth/store';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { UserHeaderCard } from '@/components/ui/UserHeaderCard';
import { OfferActionButton } from '@/components/ui/OfferActionButton';
import { IconEye, IconEyeOff } from '@/components/ui/icons/icons';
import { buildApiUrl } from '@/lib/api/url';

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

  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [isProfileEditing, setIsProfileEditing] = React.useState(false);
  const [isSecurityEditing, setIsSecurityEditing] = React.useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);
  const [isSavingBio, setIsSavingBio] = React.useState(false);
  const [isBioEditing, setIsBioEditing] = React.useState(false);
  const [isSavingPassword, setIsSavingPassword] = React.useState(false);
  const [bioDraft, setBioDraft] = React.useState('');
  const [profileForm, setProfileForm] = React.useState({ name: '', city: '' });
  const [avatarFileName, setAvatarFileName] = React.useState('');
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [passwordForm, setPasswordForm] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const passwordChecks = React.useMemo(() => {
    const value = passwordForm.newPassword;
    return {
      length: value.length >= 8,
      upper: /[A-ZА-ЯЁ]/.test(value),
      lower: /[a-zа-яё]/.test(value),
      digit: /\d/.test(value),
      symbol: /[^A-Za-zА-Яа-яЁё0-9]/.test(value),
    };
  }, [passwordForm.newPassword]);

  const isPasswordStrong = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch =
    passwordForm.confirmPassword.length > 0 &&
    passwordForm.confirmPassword === passwordForm.newPassword;

  const { data: myRequests = [] } = useQuery({
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
  const { data: myProviderPublic } = useQuery({
    queryKey: ['provider-public-self', authMe?.id],
    enabled: Boolean(authMe?.id),
    queryFn: async () => {
      const list = await listPublicProviders();
      return list.find((item) => item.id === authMe?.id) ?? null;
    },
  });

  React.useEffect(() => {
    setProfileForm({
      name: authMe?.name ?? '',
      city: authMe?.city ?? '',
    });
    setBioDraft(authMe?.bio ?? '');
    setIsBioEditing(false);
    setIsProfileEditing(false);
    setIsSecurityEditing(false);
  }, [authMe?.name, authMe?.city, authMe?.bio]);

  const isProfileDirty = React.useMemo(
    () =>
      isProfileEditing &&
      (profileForm.name !== (authMe?.name ?? '') || profileForm.city !== (authMe?.city ?? '')),
    [authMe?.city, authMe?.name, isProfileEditing, profileForm.city, profileForm.name],
  );
  const isBioDirty = React.useMemo(
    () => isBioEditing && bioDraft !== (authMe?.bio ?? ''),
    [authMe?.bio, bioDraft, isBioEditing],
  );
  const isSecurityDirty = React.useMemo(
    () =>
      isSecurityEditing &&
      (passwordForm.currentPassword.length > 0 ||
        passwordForm.newPassword.length > 0 ||
        passwordForm.confirmPassword.length > 0),
    [isSecurityEditing, passwordForm.confirmPassword.length, passwordForm.currentPassword.length, passwordForm.newPassword.length],
  );
  const hasUnsavedChanges = isProfileDirty || isBioDirty || isSecurityDirty;

  React.useEffect(() => {
    if (!hasUnsavedChanges) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [hasUnsavedChanges]);

  const guardNavigation = React.useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (!hasUnsavedChanges) return;
      const shouldLeave = window.confirm('Du hast ungespeicherte Aenderungen. Seite wirklich verlassen?');
      if (!shouldLeave) {
        event.preventDefault();
        return;
      }
    },
    [hasUnsavedChanges],
  );

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

  const profileCompleteness = React.useMemo(() => {
    const checks = [
      Boolean(authMe?.name?.trim()),
      Boolean(authMe?.city?.trim()),
      Boolean(authMe?.phone?.trim()),
      Boolean(authMe?.bio?.trim()),
      Boolean(avatarUrl),
    ];
    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }, [authMe?.bio, authMe?.city, authMe?.name, authMe?.phone, avatarUrl]);

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
      });
      setMe(updated);
      setIsProfileEditing(false);
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
    setAvatarFileName(file.name);

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

  const handleSavePassword = async () => {
    if (!isPasswordStrong) {
      toast.error('Passwort: mind. 8 Zeichen, Gross/Klein, Zahl und Sonderzeichen');
      return;
    }
    if (!passwordsMatch) {
      toast.error('Passwoerter stimmen nicht ueberein');
      return;
    }
    setIsSavingPassword(true);
    try {
      await changeMyPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsSecurityEditing(false);
      toast.success('Passwort geaendert');
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const overview = [
    { label: 'Meine Anfragen', value: myRequests.length, href: '/requests?tab=my-requests' },
    { label: 'Meine Angebote', value: offersTotal, href: '/requests?tab=my-offers' },
    { label: 'Vertraege', value: contracts.length, href: '/requests?tab=completed-jobs' },
    { label: 'Posteingang', value: unreadTotal, href: '/chat' },
  ];

  const avatarInitial = (authMe?.name?.trim()?.charAt(0) || 'U').toUpperCase();
  const avatarPreviewUrl = (() => {
    const raw = avatarUrl?.trim();
    if (!raw) return null;
    if (raw === '/avatars/default.png' || raw.endsWith('/avatars/default.png')) return null;
    if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:image/')) return raw;
    if (raw.startsWith('/')) return raw.startsWith('/api/') ? raw : buildApiUrl(raw);
    return raw;
  })();
  const localeIsDe = locale === 'de';
  const fileButtonLabel = localeIsDe ? 'Datei auswaehlen' : 'Choose file';
  const noFileLabel = localeIsDe ? 'Keine Datei ausgewaehlt' : 'No file selected';

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
            onChange={(event) => setBioDraft(event.target.value)}
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

      <section className="card profile-settings">
        <header className="profile-settings__header">
          <h2 className="typo-h3">Einstellungen</h2>
          <p className="typo-small">Konto, Sicherheit und App-Einstellungen</p>
        </header>

        <div className="profile-settings__grid">
          <article className="profile-settings__card profile-settings__card--full stack-sm">
            <header className="profile-settings__card-head">
              <p className="text-sm font-semibold">Profilfoto</p>
            </header>
            <div className="stack-xs">
              <div className="profile-settings__avatar-row">
                <span
                  className={`profile-settings__avatar ${avatarPreviewUrl ? '' : 'profile-settings__avatar--placeholder'}`.trim()}
                >
                  {avatarPreviewUrl ? (
                    <Image src={avatarPreviewUrl} alt={authMe?.name ?? 'Avatar'} width={64} height={64} />
                  ) : (
                    avatarInitial
                  )}
                  <label className="profile-settings__avatar-edit">
                    <OfferActionButton
                      kind="edit"
                      label="Avatar bearbeiten"
                      ariaLabel="Avatar bearbeiten"
                      title="Avatar bearbeiten"
                      iconOnly
                      className="request-card__status-action request-card__status-action--edit"
                    />
                    <input
                      className="sr-only"
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        void handleAvatarSelected(event);
                      }}
                      disabled={isUploadingAvatar}
                    />
                  </label>
                </span>
                <div className="profile-settings__avatar-file">
                  <p className="typo-small">{isUploadingAvatar ? 'Foto wird hochgeladen...' : 'JPG/PNG bis 10MB'}</p>
                  <p className="typo-small">{fileButtonLabel}: {avatarFileName || noFileLabel}</p>
                </div>
              </div>
            </div>
          </article>

          <article className="profile-settings__card stack-sm">
            <header className="profile-settings__card-head">
              <p className="text-sm font-semibold">Persoenliche Daten</p>
              <OfferActionButton
                kind="edit"
                label="Profil bearbeiten"
                ariaLabel="Profil bearbeiten"
                title="Profil bearbeiten"
                iconOnly
                className="request-card__status-action request-card__status-action--edit"
                onClick={() => setIsProfileEditing((prev) => !prev)}
              />
            </header>
            <label className="profile-settings__row">
              <span className="typo-small profile-settings__row-label">Vollstaendiger Name</span>
              <input
                className="input"
                value={profileForm.name}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, name: event.target.value }))}
                readOnly={!isProfileEditing}
              />
            </label>
            <label className="profile-settings__row">
              <span className="typo-small profile-settings__row-label">Stadt (optional)</span>
              <input
                className="input"
                value={profileForm.city}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, city: event.target.value }))}
                readOnly={!isProfileEditing}
              />
            </label>
            <label className="profile-settings__row">
              <span className="typo-small profile-settings__row-label">Email</span>
              <input className="input" value={authMe?.email ?? ''} readOnly />
            </label>
            {isProfileEditing ? (
              <div className="profile-settings__inline-actions">
                <button
                  type="button"
                  className="btn-primary profile-settings__save-btn"
                  onClick={() => {
                    void handleSaveProfile();
                  }}
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? t(I18N_KEYS.common.refreshing) : 'Speichern'}
                </button>
                <button
                  type="button"
                  className="btn-ghost profile-settings__text-action"
                  onClick={() => {
                    setProfileForm({
                      name: authMe?.name ?? '',
                      city: authMe?.city ?? '',
                    });
                    setIsProfileEditing(false);
                  }}
                  disabled={isSavingProfile}
                >
                  Abbrechen
                </button>
              </div>
            ) : null}
          </article>

          <article className="profile-settings__card stack-sm">
            <header className="profile-settings__card-head">
              <p className="text-sm font-semibold">Login und Sicherheit</p>
              <OfferActionButton
                kind="edit"
                label="Sicherheit bearbeiten"
                ariaLabel="Sicherheit bearbeiten"
                title="Sicherheit bearbeiten"
                iconOnly
                className="request-card__status-action request-card__status-action--edit"
                onClick={() => setIsSecurityEditing((prev) => !prev)}
              />
            </header>
            <label className="profile-settings__row">
              <span className="typo-small profile-settings__row-label">Login</span>
              <input className="input" value={authMe?.email ?? ''} disabled />
            </label>
            <label className="profile-settings__row">
              <span className="typo-small profile-settings__row-label">Aktuelles Passwort</span>
              {isSecurityEditing ? (
                <span className="profile-settings__password-field">
                  <input
                    className="input"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))
                    }
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="profile-settings__password-toggle"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    aria-label={showCurrentPassword ? 'Passwort ausblenden' : 'Passwort anzeigen'}
                    title={showCurrentPassword ? 'Passwort ausblenden' : 'Passwort anzeigen'}
                  >
                    {showCurrentPassword ? <IconEye /> : <IconEyeOff />}
                  </button>
                </span>
              ) : (
                <input className="input" type="password" value="••••••••••••" readOnly />
              )}
            </label>
            {isSecurityEditing ? (
              <label className="profile-settings__row">
                <span className="typo-small profile-settings__row-label">Neues Passwort</span>
                <span className="profile-settings__password-field profile-settings__password-field--accent">
                  <input
                    className={`input ${passwordForm.newPassword.length > 0 && !isPasswordStrong ? 'is-error' : ''}`.trim()}
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
                    }
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="profile-settings__password-toggle"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    aria-label={showNewPassword ? 'Passwort ausblenden' : 'Passwort anzeigen'}
                    title={showNewPassword ? 'Passwort ausblenden' : 'Passwort anzeigen'}
                  >
                    {showNewPassword ? <IconEye /> : <IconEyeOff />}
                  </button>
                </span>
              </label>
            ) : null}
            {isSecurityEditing ? (
              <label className="profile-settings__row">
                <span className="typo-small profile-settings__row-label">Passwort wiederholen</span>
                <span className="profile-settings__password-field profile-settings__password-field--accent">
                  <input
                    className={`input ${passwordForm.confirmPassword.length > 0 && !passwordsMatch ? 'is-error' : ''}`.trim()}
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                    }
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="profile-settings__password-toggle"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? 'Passwort ausblenden' : 'Passwort anzeigen'}
                    title={showConfirmPassword ? 'Passwort ausblenden' : 'Passwort anzeigen'}
                  >
                    {showConfirmPassword ? <IconEye /> : <IconEyeOff />}
                  </button>
                </span>
              </label>
            ) : null}
            {isSecurityEditing ? (
              <div className="profile-settings__password-hint">
                <span className={passwordChecks.length ? 'is-ok' : ''}>8+ Zeichen</span>
                <span className={passwordChecks.upper ? 'is-ok' : ''}>Grossbuchstabe</span>
                <span className={passwordChecks.lower ? 'is-ok' : ''}>Kleinbuchstabe</span>
                <span className={passwordChecks.digit ? 'is-ok' : ''}>Zahl</span>
                <span className={passwordChecks.symbol ? 'is-ok' : ''}>Sonderzeichen</span>
              </div>
            ) : null}
            {isSecurityEditing ? (
              <div className="profile-settings__inline-actions">
                <button
                  type="button"
                  className="btn-primary profile-settings__save-btn"
                  onClick={() => {
                    void handleSavePassword();
                  }}
                  disabled={isSavingPassword}
                >
                  {isSavingPassword ? t(I18N_KEYS.common.refreshing) : 'Speichern'}
                </button>
                <button
                  type="button"
                  className="btn-ghost profile-settings__text-action"
                  onClick={() => {
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setIsSecurityEditing(false);
                    setShowCurrentPassword(false);
                    setShowNewPassword(false);
                    setShowConfirmPassword(false);
                  }}
                  disabled={isSavingPassword}
                >
                  Abbrechen
                </button>
              </div>
            ) : null}
          </article>

          <article className="profile-settings__card stack-sm">
            <header className="profile-settings__card-head">
              <p className="text-sm font-semibold">Darstellung</p>
              <p className="typo-small">Waehle das Theme fuer deine Oberflaeche.</p>
            </header>
            <div className="profile-settings__choices">
              <button
                type="button"
                className={`profile-settings__choice ${resolvedTheme === 'light' ? 'is-active' : ''}`.trim()}
                onClick={() => setTheme('light')}
              >
                Light
              </button>
              <button
                type="button"
                className={`profile-settings__choice ${resolvedTheme === 'dark' ? 'is-active' : ''}`.trim()}
                onClick={() => setTheme('dark')}
              >
                Dark
              </button>
            </div>
          </article>

          <article className="profile-settings__card stack-sm">
            <header className="profile-settings__card-head">
              <p className="text-sm font-semibold">Sprache</p>
              <p className="typo-small">Steuere Lokalisierung und Interface-Sprache.</p>
            </header>
            <div className="profile-settings__choices">
              <button
                type="button"
                className={`profile-settings__choice ${locale === 'de' ? 'is-active' : ''}`.trim()}
                onClick={() => setLocale('de')}
              >
                Deutsch
              </button>
              <button
                type="button"
                className={`profile-settings__choice ${locale === 'en' ? 'is-active' : ''}`.trim()}
                onClick={() => setLocale('en')}
              >
                English
              </button>
            </div>
            <div className="profile-settings__meta">
              <p className="typo-small">Aktuell: {locale.toUpperCase()}</p>
              <p className="typo-small">Favoriten gesamt: {favoritesTotal}</p>
            </div>
          </article>
        </div>
      </section>

      <section className="card stack-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="typo-h3">Kurzueberblick</h2>
          <span className="badge">Profil: {profileCompleteness}%</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {overview.map((item) => (
            <Link key={item.label} href={item.href} className="card stack-xs no-underline" onClick={guardNavigation}>
              <p className="typo-small">{item.label}</p>
              <p className="typo-h3">{item.value}</p>
              <p className="typo-small">Alle ansehen</p>
            </Link>
          ))}
        </div>
        <Link href="/requests?tab=new-orders" className="btn-primary w-fit" onClick={guardNavigation}>
          Profil vervollstaendigen
        </Link>
      </section>
    </PageShell>
  );
}
