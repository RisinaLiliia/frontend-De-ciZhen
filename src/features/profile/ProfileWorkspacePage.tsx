'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { changeMyPassword, updateMe, uploadMyAvatar } from '@/lib/api/users';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useAuthMe, useHasProviderProfile } from '@/hooks/useAuthSnapshot';
import { useAuthStore } from '@/features/auth/store';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { UserHeaderCard } from '@/components/ui/UserHeaderCard';
import { OfferActionButton } from '@/components/ui/OfferActionButton';
import { FormLabel } from '@/components/ui/FormLabel';
import { IconEye, IconEyeOff } from '@/components/ui/icons/icons';
import { useConsent } from '@/lib/consent/ConsentProvider';
import {
  computeManualProfileCompleteness,
  resolveAvatarPreviewUrl,
  resolveProfileCompleteness,
} from '@/features/profile/profileWorkspace.presentation';
import { useProfileWorkspaceData } from '@/features/profile/useProfileWorkspaceData';

export default function ProfileWorkspacePage() {
  const t = useT();
  const requiredHint = t(I18N_KEYS.common.requiredFieldHint);
  const authMe = useAuthMe();
  const hasProviderProfile = useHasProviderProfile();
  const setMe = useAuthStore((s) => s.setMe);
  const { locale, setLocale } = useI18n();
  const { resolvedTheme, setTheme } = useTheme();
  const { choice: consentChoice, openPreferences } = useConsent();
  const [isThemeReady, setIsThemeReady] = React.useState(false);

  React.useEffect(() => {
    setIsThemeReady(true);
  }, []);

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

  const {
    favoritesTotal,
    ratingValue,
    reviewCount,
    dominantStats,
    overviewCounts,
    myProviderProfile,
  } = useProfileWorkspaceData({
    authMeId: authMe?.id,
    hasProviderProfile,
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
      const shouldLeave = window.confirm(t(I18N_KEYS.client.profileUnsavedChangesConfirm));
      if (!shouldLeave) {
        event.preventDefault();
        return;
      }
    },
    [hasUnsavedChanges, t],
  );

  const avatarUrl = authMe?.avatar?.url?.trim() || null;
  const profileDescription = bioDraft.trim();

  const manualProfileCompleteness = React.useMemo(
    () =>
      computeManualProfileCompleteness({
        name: authMe?.name,
        city: authMe?.city,
        phone: authMe?.phone,
        bio: authMe?.bio,
        avatarUrl,
      }),
    [authMe?.bio, authMe?.city, authMe?.name, authMe?.phone, avatarUrl],
  );
  const profileCompleteness = React.useMemo(
    () =>
      resolveProfileCompleteness({
        manualProfileCompleteness,
        hasProviderProfile,
        providerProfile: myProviderProfile,
      }),
    [hasProviderProfile, manualProfileCompleteness, myProviderProfile],
  );
  const effectiveTheme = isThemeReady ? resolvedTheme : 'light';

  const handleSaveProfile = async () => {
    const name = profileForm.name.trim();
    if (name.length < 2) {
      toast.error(t(I18N_KEYS.client.profileNameMinError));
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
      toast.success(t(I18N_KEYS.client.profileUpdated));
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
      toast.success(t(I18N_KEYS.client.profileBioUpdated));
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
      toast.success(t(I18N_KEYS.client.profilePhotoUpdated));
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
      toast.error(t(I18N_KEYS.client.profilePasswordPolicyError));
      return;
    }
    if (!passwordsMatch) {
      toast.error(t(I18N_KEYS.client.profilePasswordMismatchError));
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
      toast.success(t(I18N_KEYS.client.profilePasswordUpdated));
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const overview = [
    { label: t(I18N_KEYS.client.profileOverviewRequestsLabel), value: overviewCounts.requests, href: '/workspace?tab=my-requests' },
    { label: t(I18N_KEYS.client.profileOverviewOffersLabel), value: overviewCounts.offers, href: '/workspace?tab=my-offers' },
    { label: t(I18N_KEYS.client.profileOverviewContractsLabel), value: overviewCounts.contracts, href: '/workspace?tab=completed-jobs' },
    { label: t(I18N_KEYS.client.profileOverviewInboxLabel), value: overviewCounts.inbox, href: '/chat' },
  ];

  const avatarInitial = (authMe?.name?.trim()?.charAt(0) || 'U').toUpperCase();
  const avatarPreviewUrl = resolveAvatarPreviewUrl(avatarUrl);
  const fileButtonLabel = t(I18N_KEYS.client.profileFileChoose);
  const noFileLabel = t(I18N_KEYS.client.profileFileNone);

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
              <p className="profile-bio__label">{t(I18N_KEYS.client.profileBioLabel)}</p>
            </div>
            <span className="count-badge count-badge--sm">{profileDescription.length}/2000</span>
          </header>

          <textarea
            className={`input profile-bio__textarea ${isBioEditing ? '' : 'profile-bio__textarea--readonly'}`.trim()}
            value={bioDraft}
            onChange={(event) => setBioDraft(event.target.value)}
            maxLength={2000}
            placeholder={t(I18N_KEYS.client.profileBioPlaceholder)}
            readOnly={!isBioEditing}
          />

          <div className="profile-bio__footer">
              <p className="profile-bio__hint">
                {profileDescription
                  ? t(I18N_KEYS.client.profileBioHintFilled)
                  : t(I18N_KEYS.client.profileBioHintEmpty)}
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
                  {t(I18N_KEYS.client.profileCancelCta)}
                </button>
                <button
                  type="button"
                  className="btn-primary profile-bio__action"
                  onClick={() => {
                    void handleSaveBio();
                  }}
                  disabled={isSavingBio}
                >
                  {isSavingBio ? t(I18N_KEYS.common.refreshing) : t(I18N_KEYS.client.profileSaveCta)}
                </button>
              </div>
            ) : (
              <OfferActionButton
                kind="edit"
                label={t(I18N_KEYS.client.profileBioEditAction)}
                ariaLabel={t(I18N_KEYS.client.profileBioEditAction)}
                title={t(I18N_KEYS.client.profileBioEditAction)}
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
          <h2 className="typo-h3">{t(I18N_KEYS.client.profileSettingsTitle)}</h2>
          <p className="typo-small">{t(I18N_KEYS.client.profileSettingsSubtitle)}</p>
        </header>

        <div className="profile-settings__grid">
          <article className="profile-settings__card profile-settings__card--full stack-sm">
            <header className="profile-settings__card-head">
              <p className="text-sm font-semibold">{t(I18N_KEYS.client.profilePhotoTitle)}</p>
            </header>
            <div className="stack-xs">
              <div className="profile-settings__avatar-row">
                <span
                  className={`profile-settings__avatar ${avatarPreviewUrl ? '' : 'profile-settings__avatar--placeholder'}`.trim()}
                >
                  {avatarPreviewUrl ? (
                    <Image src={avatarPreviewUrl} alt={authMe?.name ?? t(I18N_KEYS.client.profileAvatarAlt)} width={64} height={64} />
                  ) : (
                    avatarInitial
                  )}
                  <label className="profile-settings__avatar-edit">
                    <OfferActionButton
                      kind="edit"
                      label={t(I18N_KEYS.client.profileAvatarEditAction)}
                      ariaLabel={t(I18N_KEYS.client.profileAvatarEditAction)}
                      title={t(I18N_KEYS.client.profileAvatarEditAction)}
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
                  <p className="typo-small">{isUploadingAvatar ? t(I18N_KEYS.client.profilePhotoUploading) : t(I18N_KEYS.client.profilePhotoFormatHint)}</p>
                  <p className="typo-small">{fileButtonLabel}: {avatarFileName || noFileLabel}</p>
                </div>
              </div>
            </div>
          </article>

          <article className="profile-settings__card stack-sm">
            <header className="profile-settings__card-head">
              <p className="text-sm font-semibold">{t(I18N_KEYS.client.profilePersonalDataTitle)}</p>
              <OfferActionButton
                kind="edit"
                label={t(I18N_KEYS.client.profileEditAction)}
                ariaLabel={t(I18N_KEYS.client.profileEditAction)}
                title={t(I18N_KEYS.client.profileEditAction)}
                iconOnly
                className="request-card__status-action request-card__status-action--edit"
                onClick={() => setIsProfileEditing((prev) => !prev)}
              />
            </header>
            <div className="profile-settings__row">
              <FormLabel
                className="profile-settings__row-label"
                htmlFor="profile-full-name"
                required
                requiredHint={requiredHint}
              >
                {t(I18N_KEYS.client.profileFullNameLabel)}
              </FormLabel>
              <input
                id="profile-full-name"
                className="input"
                value={profileForm.name}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, name: event.target.value }))}
                readOnly={!isProfileEditing}
              />
            </div>
            <div className="profile-settings__row">
              <FormLabel className="profile-settings__row-label" htmlFor="profile-city">
                {t(I18N_KEYS.client.profileCityOptionalLabel)}
              </FormLabel>
              <input
                id="profile-city"
                className="input"
                value={profileForm.city}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, city: event.target.value }))}
                readOnly={!isProfileEditing}
              />
            </div>
            <div className="profile-settings__row">
              <FormLabel
                className="profile-settings__row-label"
                htmlFor="profile-email"
                required
                requiredHint={requiredHint}
              >
                {t(I18N_KEYS.client.profileEmailLabel)}
              </FormLabel>
              <input id="profile-email" className="input" value={authMe?.email ?? ''} readOnly />
            </div>
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
                  {isSavingProfile ? t(I18N_KEYS.common.refreshing) : t(I18N_KEYS.client.profileSaveCta)}
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
                  {t(I18N_KEYS.client.profileCancelCta)}
                </button>
              </div>
            ) : null}
          </article>

          <article className="profile-settings__card stack-sm">
            <header className="profile-settings__card-head">
              <p className="text-sm font-semibold">{t(I18N_KEYS.client.profileSecurityTitle)}</p>
              <OfferActionButton
                kind="edit"
                label={t(I18N_KEYS.client.profileSecurityEditAction)}
                ariaLabel={t(I18N_KEYS.client.profileSecurityEditAction)}
                title={t(I18N_KEYS.client.profileSecurityEditAction)}
                iconOnly
                className="request-card__status-action request-card__status-action--edit"
                onClick={() => setIsSecurityEditing((prev) => !prev)}
              />
            </header>
            <div className="profile-settings__row">
              <FormLabel
                className="profile-settings__row-label"
                htmlFor="security-login"
                required
                requiredHint={requiredHint}
              >
                {t(I18N_KEYS.client.profileLoginLabel)}
              </FormLabel>
              <input id="security-login" className="input" value={authMe?.email ?? ''} disabled />
            </div>
            <div className="profile-settings__row">
              <FormLabel
                className="profile-settings__row-label"
                htmlFor="security-current-password"
                required
                requiredHint={requiredHint}
              >
                {t(I18N_KEYS.client.profileCurrentPasswordLabel)}
              </FormLabel>
              {isSecurityEditing ? (
                <span className="profile-settings__password-field">
                  <input
                    id="security-current-password"
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
                    aria-label={showCurrentPassword ? t(I18N_KEYS.client.profilePasswordHide) : t(I18N_KEYS.client.profilePasswordShow)}
                    title={showCurrentPassword ? t(I18N_KEYS.client.profilePasswordHide) : t(I18N_KEYS.client.profilePasswordShow)}
                  >
                    {showCurrentPassword ? <IconEye /> : <IconEyeOff />}
                  </button>
                </span>
              ) : (
                <input id="security-current-password" className="input" type="password" value="••••••••••••" readOnly />
              )}
            </div>
            {isSecurityEditing ? (
              <div className="profile-settings__row">
                <FormLabel
                  className="profile-settings__row-label"
                  htmlFor="security-new-password"
                  required
                  requiredHint={requiredHint}
                >
                  {t(I18N_KEYS.client.profileNewPasswordLabel)}
                </FormLabel>
                <span className="profile-settings__password-field profile-settings__password-field--accent">
                  <input
                    id="security-new-password"
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
                    aria-label={showNewPassword ? t(I18N_KEYS.client.profilePasswordHide) : t(I18N_KEYS.client.profilePasswordShow)}
                    title={showNewPassword ? t(I18N_KEYS.client.profilePasswordHide) : t(I18N_KEYS.client.profilePasswordShow)}
                  >
                    {showNewPassword ? <IconEye /> : <IconEyeOff />}
                  </button>
                </span>
              </div>
            ) : null}
            {isSecurityEditing ? (
              <div className="profile-settings__row">
                <FormLabel
                  className="profile-settings__row-label"
                  htmlFor="security-confirm-password"
                  required
                  requiredHint={requiredHint}
                >
                  {t(I18N_KEYS.client.profileConfirmPasswordLabel)}
                </FormLabel>
                <span className="profile-settings__password-field profile-settings__password-field--accent">
                  <input
                    id="security-confirm-password"
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
                    aria-label={showConfirmPassword ? t(I18N_KEYS.client.profilePasswordHide) : t(I18N_KEYS.client.profilePasswordShow)}
                    title={showConfirmPassword ? t(I18N_KEYS.client.profilePasswordHide) : t(I18N_KEYS.client.profilePasswordShow)}
                  >
                    {showConfirmPassword ? <IconEye /> : <IconEyeOff />}
                  </button>
                </span>
              </div>
            ) : null}
            {isSecurityEditing ? (
              <div className="profile-settings__password-hint">
                <span className={passwordChecks.length ? 'is-ok' : ''}>{t(I18N_KEYS.auth.passwordRuleLength)}</span>
                <span className={passwordChecks.upper ? 'is-ok' : ''}>{t(I18N_KEYS.auth.passwordRuleUpper)}</span>
                <span className={passwordChecks.lower ? 'is-ok' : ''}>{t(I18N_KEYS.auth.passwordRuleLower)}</span>
                <span className={passwordChecks.digit ? 'is-ok' : ''}>{t(I18N_KEYS.auth.passwordRuleDigit)}</span>
                <span className={passwordChecks.symbol ? 'is-ok' : ''}>{t(I18N_KEYS.auth.passwordRuleSymbol)}</span>
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
                  {isSavingPassword ? t(I18N_KEYS.common.refreshing) : t(I18N_KEYS.client.profileSaveCta)}
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
                  {t(I18N_KEYS.client.profileCancelCta)}
                </button>
              </div>
            ) : null}
          </article>

          <article className="profile-settings__card stack-sm">
            <header className="profile-settings__card-head">
              <p className="text-sm font-semibold">{t(I18N_KEYS.client.profileThemeTitle)}</p>
              <p className="typo-small">{t(I18N_KEYS.client.profileThemeSubtitle)}</p>
            </header>
            <div className="profile-settings__choices">
              <button
                type="button"
                className={`profile-settings__choice ${effectiveTheme === 'light' ? 'is-active' : ''}`.trim()}
                onClick={() => setTheme('light')}
              >
                {t(I18N_KEYS.common.themeLight)}
              </button>
              <button
                type="button"
                className={`profile-settings__choice ${effectiveTheme === 'dark' ? 'is-active' : ''}`.trim()}
                onClick={() => setTheme('dark')}
              >
                {t(I18N_KEYS.common.themeDark)}
              </button>
            </div>
          </article>

          <article className="profile-settings__card stack-sm">
            <header className="profile-settings__card-head">
              <p className="text-sm font-semibold">{t(I18N_KEYS.client.profileLanguageTitle)}</p>
              <p className="typo-small">{t(I18N_KEYS.client.profileLanguageSubtitle)}</p>
            </header>
            <div className="profile-settings__choices">
              <button
                type="button"
                className={`profile-settings__choice ${locale === 'de' ? 'is-active' : ''}`.trim()}
                onClick={() => setLocale('de')}
              >
                {t(I18N_KEYS.common.languageGerman)}
              </button>
              <button
                type="button"
                className={`profile-settings__choice ${locale === 'en' ? 'is-active' : ''}`.trim()}
                onClick={() => setLocale('en')}
              >
                {t(I18N_KEYS.common.languageEnglish)}
              </button>
            </div>
            <div className="profile-settings__meta">
              <p className="typo-small">{t(I18N_KEYS.client.profileLanguageCurrentPrefix)}: {locale.toUpperCase()}</p>
              <p className="typo-small">{t(I18N_KEYS.client.profileFavoritesTotalPrefix)}: {favoritesTotal}</p>
            </div>
          </article>

          <article className="profile-settings__card stack-sm">
            <header className="profile-settings__card-head">
              <p className="text-sm font-semibold">{t(I18N_KEYS.client.profilePrivacyTitle)}</p>
              <p className="typo-small">{t(I18N_KEYS.client.profilePrivacySubtitle)}</p>
            </header>
            <div className="profile-settings__meta">
              <p className="typo-small">
                {t(I18N_KEYS.client.profileAnalyticsLabel)}: {consentChoice.analytics ? t(I18N_KEYS.client.profileEnabled) : t(I18N_KEYS.client.profileDisabled)}
              </p>
              <p className="typo-small">
                {t(I18N_KEYS.client.profileMarketingLabel)}: {consentChoice.marketing ? t(I18N_KEYS.client.profileEnabled) : t(I18N_KEYS.client.profileDisabled)}
              </p>
            </div>
            <div className="profile-settings__inline-actions">
              <button
                type="button"
                className="btn-secondary profile-settings__save-btn"
                onClick={openPreferences}
              >
                {t(I18N_KEYS.client.profileOpenCookieSettingsCta)}
              </button>
            </div>
          </article>
        </div>
      </section>

      <section className="card stack-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="typo-h3">{t(I18N_KEYS.client.profileOverviewTitle)}</h2>
          <span className="badge">{t(I18N_KEYS.client.profileOverviewCompletenessPrefix)}: {profileCompleteness}%</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {overview.map((item) => (
            <Link key={item.label} href={item.href} prefetch={false} className="card stack-xs no-underline" onClick={guardNavigation}>
              <p className="typo-small">{item.label}</p>
              <p className="typo-h3">{item.value}</p>
              <p className="typo-small">{t(I18N_KEYS.client.profileOverviewViewAll)}</p>
            </Link>
          ))}
        </div>
        <Link href="/workspace?section=requests" prefetch={false} className="btn-primary w-fit" onClick={guardNavigation}>
          {t(I18N_KEYS.client.profileCompleteProfileCta)}
        </Link>
      </section>
    </PageShell>
  );
}
