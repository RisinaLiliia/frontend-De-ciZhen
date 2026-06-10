'use client';

import * as React from 'react';
import { toast } from 'sonner';

import { FormLabel } from '@/components/ui/FormLabel';
import { IconEye, IconEyeOff } from '@/components/ui/icons/icons';
import { changeMyPassword, updateMe } from '@/lib/api/users';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useT } from '@/lib/i18n/useT';
import { useAuthMe } from '@/hooks/useAuthSnapshot';
import { useAuthStore } from '@/features/auth/store';

type PasswordField = 'currentPassword' | 'newPassword' | 'confirmPassword';

export function WorkspaceAccountSettingsSection() {
  const t = useT();
  const requiredHint = t(I18N_KEYS.common.requiredFieldHint);
  const authMe = useAuthMe();
  const setMe = useAuthStore((state) => state.setMe);

  const [isProfileEditing, setIsProfileEditing] = React.useState(false);
  const [isSecurityEditing, setIsSecurityEditing] = React.useState(false);
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [isSavingPassword, setIsSavingPassword] = React.useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [profileForm, setProfileForm] = React.useState({ name: '', city: '' });
  const [passwordForm, setPasswordForm] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  React.useEffect(() => {
    setProfileForm({
      name: authMe?.name ?? '',
      city: authMe?.city ?? '',
    });
  }, [authMe?.city, authMe?.name]);

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

  const isPasswordStrong = React.useMemo(
    () => Object.values(passwordChecks).every(Boolean),
    [passwordChecks],
  );
  const passwordsMatch = React.useMemo(
    () =>
      passwordForm.confirmPassword.length > 0 &&
      passwordForm.confirmPassword === passwordForm.newPassword,
    [passwordForm.confirmPassword, passwordForm.newPassword],
  );

  const handleProfileFieldChange = React.useCallback((field: 'name' | 'city', value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handlePasswordFieldChange = React.useCallback((field: PasswordField, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSaveProfile = React.useCallback(async () => {
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
  }, [profileForm.city, profileForm.name, setMe, t]);

  const handleCancelProfile = React.useCallback(() => {
    setProfileForm({
      name: authMe?.name ?? '',
      city: authMe?.city ?? '',
    });
    setIsProfileEditing(false);
  }, [authMe?.city, authMe?.name]);

  const handleSavePassword = React.useCallback(async () => {
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
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      toast.success(t(I18N_KEYS.client.profilePasswordUpdated));
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    } finally {
      setIsSavingPassword(false);
    }
  }, [isPasswordStrong, passwordForm.currentPassword, passwordForm.newPassword, passwordsMatch, t]);

  const handleCancelSecurity = React.useCallback(() => {
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setIsSecurityEditing(false);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  }, []);

  return (
    <>
      <article className="profile-settings__card stack-sm">
        <header className="profile-settings__card-head">
          <p className="text-sm font-semibold">{t(I18N_KEYS.client.profilePersonalDataTitle)}</p>
          <button
            type="button"
            className="request-card__status-action request-card__status-action--edit"
            onClick={() => setIsProfileEditing((prev) => !prev)}
            aria-label={t(I18N_KEYS.client.profileEditAction)}
            title={t(I18N_KEYS.client.profileEditAction)}
          >
            <span aria-hidden="true">✎</span>
          </button>
        </header>
        <div className="profile-settings__row">
          <FormLabel
            className="profile-settings__row-label"
            htmlFor="workspace-settings-full-name"
            required
            requiredHint={requiredHint}
          >
            {t(I18N_KEYS.client.profileFullNameLabel)}
          </FormLabel>
          <input
            id="workspace-settings-full-name"
            className="input"
            value={profileForm.name}
            onChange={(event) => handleProfileFieldChange('name', event.target.value)}
            readOnly={!isProfileEditing}
          />
        </div>
        <div className="profile-settings__row">
          <FormLabel className="profile-settings__row-label" htmlFor="workspace-settings-city">
            {t(I18N_KEYS.client.profileCityOptionalLabel)}
          </FormLabel>
          <input
            id="workspace-settings-city"
            className="input"
            value={profileForm.city}
            onChange={(event) => handleProfileFieldChange('city', event.target.value)}
            readOnly={!isProfileEditing}
          />
        </div>
        <div className="profile-settings__row">
          <FormLabel
            className="profile-settings__row-label"
            htmlFor="workspace-settings-email"
            required
            requiredHint={requiredHint}
          >
            {t(I18N_KEYS.client.profileEmailLabel)}
          </FormLabel>
          <input
            id="workspace-settings-email"
            className="input"
            value={authMe?.email ?? ''}
            readOnly
          />
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
              {isSavingProfile
                ? t(I18N_KEYS.common.refreshing)
                : t(I18N_KEYS.client.profileSaveCta)}
            </button>
            <button
              type="button"
              className="btn-ghost profile-settings__text-action"
              onClick={handleCancelProfile}
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
          <button
            type="button"
            className="request-card__status-action request-card__status-action--edit"
            onClick={() => setIsSecurityEditing((prev) => !prev)}
            aria-label={t(I18N_KEYS.client.profileSecurityEditAction)}
            title={t(I18N_KEYS.client.profileSecurityEditAction)}
          >
            <span aria-hidden="true">✎</span>
          </button>
        </header>
        <div className="profile-settings__row">
          <FormLabel
            className="profile-settings__row-label"
            htmlFor="workspace-settings-login"
            required
            requiredHint={requiredHint}
          >
            {t(I18N_KEYS.client.profileLoginLabel)}
          </FormLabel>
          <input
            id="workspace-settings-login"
            className="input"
            value={authMe?.email ?? ''}
            disabled
          />
        </div>
        <div className="profile-settings__row">
          <FormLabel
            className="profile-settings__row-label"
            htmlFor="workspace-settings-current-password"
            required
            requiredHint={requiredHint}
          >
            {t(I18N_KEYS.client.profileCurrentPasswordLabel)}
          </FormLabel>
          {isSecurityEditing ? (
            <span className="profile-settings__password-field">
              <input
                id="workspace-settings-current-password"
                className="input"
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  handlePasswordFieldChange('currentPassword', event.target.value)
                }
                autoComplete="current-password"
              />
              <button
                type="button"
                className="profile-settings__password-toggle"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                aria-label={
                  showCurrentPassword
                    ? t(I18N_KEYS.client.profilePasswordHide)
                    : t(I18N_KEYS.client.profilePasswordShow)
                }
                title={
                  showCurrentPassword
                    ? t(I18N_KEYS.client.profilePasswordHide)
                    : t(I18N_KEYS.client.profilePasswordShow)
                }
              >
                {showCurrentPassword ? <IconEye /> : <IconEyeOff />}
              </button>
            </span>
          ) : (
            <input
              id="workspace-settings-current-password-readonly"
              className="input"
              type="password"
              value="••••••••••••"
              readOnly
            />
          )}
        </div>
        {isSecurityEditing ? (
          <>
            <div className="profile-settings__row">
              <FormLabel
                className="profile-settings__row-label"
                htmlFor="workspace-settings-new-password"
                required
                requiredHint={requiredHint}
              >
                {t(I18N_KEYS.client.profileNewPasswordLabel)}
              </FormLabel>
              <span className="profile-settings__password-field profile-settings__password-field--accent">
                <input
                  id="workspace-settings-new-password"
                  className={`input ${passwordForm.newPassword.length > 0 && !isPasswordStrong ? 'is-error' : ''}`.trim()}
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(event) => handlePasswordFieldChange('newPassword', event.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="profile-settings__password-toggle"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  aria-label={
                    showNewPassword
                      ? t(I18N_KEYS.client.profilePasswordHide)
                      : t(I18N_KEYS.client.profilePasswordShow)
                  }
                  title={
                    showNewPassword
                      ? t(I18N_KEYS.client.profilePasswordHide)
                      : t(I18N_KEYS.client.profilePasswordShow)
                  }
                >
                  {showNewPassword ? <IconEye /> : <IconEyeOff />}
                </button>
              </span>
            </div>
            <div className="profile-settings__row">
              <FormLabel
                className="profile-settings__row-label"
                htmlFor="workspace-settings-confirm-password"
                required
                requiredHint={requiredHint}
              >
                {t(I18N_KEYS.client.profileConfirmPasswordLabel)}
              </FormLabel>
              <span className="profile-settings__password-field profile-settings__password-field--accent">
                <input
                  id="workspace-settings-confirm-password"
                  className={`input ${passwordForm.confirmPassword.length > 0 && !passwordsMatch ? 'is-error' : ''}`.trim()}
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    handlePasswordFieldChange('confirmPassword', event.target.value)
                  }
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="profile-settings__password-toggle"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={
                    showConfirmPassword
                      ? t(I18N_KEYS.client.profilePasswordHide)
                      : t(I18N_KEYS.client.profilePasswordShow)
                  }
                  title={
                    showConfirmPassword
                      ? t(I18N_KEYS.client.profilePasswordHide)
                      : t(I18N_KEYS.client.profilePasswordShow)
                  }
                >
                  {showConfirmPassword ? <IconEye /> : <IconEyeOff />}
                </button>
              </span>
            </div>
            <div className="profile-settings__password-hint">
              <span className={passwordChecks.length ? 'is-ok' : ''}>
                {t(I18N_KEYS.auth.passwordRuleLength)}
              </span>
              <span className={passwordChecks.upper ? 'is-ok' : ''}>
                {t(I18N_KEYS.auth.passwordRuleUpper)}
              </span>
              <span className={passwordChecks.lower ? 'is-ok' : ''}>
                {t(I18N_KEYS.auth.passwordRuleLower)}
              </span>
              <span className={passwordChecks.digit ? 'is-ok' : ''}>
                {t(I18N_KEYS.auth.passwordRuleDigit)}
              </span>
              <span className={passwordChecks.symbol ? 'is-ok' : ''}>
                {t(I18N_KEYS.auth.passwordRuleSymbol)}
              </span>
            </div>
            <div className="profile-settings__inline-actions">
              <button
                type="button"
                className="btn-primary profile-settings__save-btn"
                onClick={() => {
                  void handleSavePassword();
                }}
                disabled={isSavingPassword}
              >
                {isSavingPassword
                  ? t(I18N_KEYS.common.refreshing)
                  : t(I18N_KEYS.client.profileSaveCta)}
              </button>
              <button
                type="button"
                className="btn-ghost profile-settings__text-action"
                onClick={handleCancelSecurity}
                disabled={isSavingPassword}
              >
                {t(I18N_KEYS.client.profileCancelCta)}
              </button>
            </div>
          </>
        ) : null}
      </article>
    </>
  );
}
