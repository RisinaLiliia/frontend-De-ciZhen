'use client';

import * as React from 'react';
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
import { useConsent } from '@/lib/consent/ConsentProvider';
import {
  computeManualProfileCompleteness,
  resolveAvatarPreviewUrl,
  resolveProfileCompleteness,
} from '@/features/profile/profileWorkspace.presentation';
import { useProfileWorkspaceData } from '@/features/profile/useProfileWorkspaceData';
import { ProfileBioSection } from '@/features/profile/ProfileBioSection';
import { ProfileOverviewSection } from '@/features/profile/ProfileOverviewSection';
import { ProfileSettingsSection } from '@/features/profile/ProfileSettingsSection';

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
  const effectiveTheme = (isThemeReady ? resolvedTheme : 'light') ?? 'light';

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
    { label: t(I18N_KEYS.client.profileOverviewRequestsLabel), value: overviewCounts.requests, href: '/workspace?section=requests&scope=my&period=90d&range=90d' },
    { label: t(I18N_KEYS.client.profileOverviewOffersLabel), value: overviewCounts.offers, href: '/workspace?section=requests&scope=my&period=90d&range=90d' },
    { label: t(I18N_KEYS.client.profileOverviewContractsLabel), value: overviewCounts.contracts, href: '/workspace?section=requests&scope=my&period=90d&range=90d' },
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
        <ProfileBioSection
          t={t}
          bioDraft={bioDraft}
          isBioEditing={isBioEditing}
          isSavingBio={isSavingBio}
          onBioChange={setBioDraft}
          onStartBioEdit={() => setIsBioEditing(true)}
          onCancelBioEdit={() => {
            setBioDraft(authMe?.bio ?? '');
            setIsBioEditing(false);
          }}
          onSaveBio={() => {
            void handleSaveBio();
          }}
        />
      </section>

      <ProfileSettingsSection
        t={t}
        requiredHint={requiredHint}
        authMe={authMe}
        avatarPreviewUrl={avatarPreviewUrl}
        avatarInitial={avatarInitial}
        isUploadingAvatar={isUploadingAvatar}
        avatarFileName={avatarFileName}
        fileButtonLabel={fileButtonLabel}
        noFileLabel={noFileLabel}
        onAvatarSelected={(event) => {
          void handleAvatarSelected(event);
        }}
        profileForm={profileForm}
        isProfileEditing={isProfileEditing}
        isSavingProfile={isSavingProfile}
        onToggleProfileEditing={() => setIsProfileEditing((prev) => !prev)}
        onProfileFieldChange={(field, value) =>
          setProfileForm((prev) => ({ ...prev, [field]: value }))
        }
        onSaveProfile={() => {
          void handleSaveProfile();
        }}
        onCancelProfile={() => {
          setProfileForm({
            name: authMe?.name ?? '',
            city: authMe?.city ?? '',
          });
          setIsProfileEditing(false);
        }}
        isSecurityEditing={isSecurityEditing}
        isSavingPassword={isSavingPassword}
        onToggleSecurityEditing={() => setIsSecurityEditing((prev) => !prev)}
        onSavePassword={() => {
          void handleSavePassword();
        }}
        onCancelSecurity={() => {
          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
          setIsSecurityEditing(false);
          setShowCurrentPassword(false);
          setShowNewPassword(false);
          setShowConfirmPassword(false);
        }}
        passwordForm={passwordForm}
        onPasswordFieldChange={(field, value) =>
          setPasswordForm((prev) => ({ ...prev, [field]: value }))
        }
        showCurrentPassword={showCurrentPassword}
        showNewPassword={showNewPassword}
        showConfirmPassword={showConfirmPassword}
        onToggleShowCurrentPassword={() => setShowCurrentPassword((prev) => !prev)}
        onToggleShowNewPassword={() => setShowNewPassword((prev) => !prev)}
        onToggleShowConfirmPassword={() => setShowConfirmPassword((prev) => !prev)}
        passwordChecks={passwordChecks}
        isPasswordStrong={isPasswordStrong}
        passwordsMatch={passwordsMatch}
        locale={locale}
        setLocale={setLocale}
        effectiveTheme={effectiveTheme}
        setTheme={setTheme}
        favoritesTotal={favoritesTotal}
        consentChoice={consentChoice}
        openPreferences={openPreferences}
      />
      <ProfileOverviewSection
        t={t}
        profileCompleteness={profileCompleteness}
        overview={overview}
        onGuardNavigation={guardNavigation}
      />
    </PageShell>
  );
}
