import * as React from 'react';
import Image from 'next/image';

import { FormLabel } from '@/components/ui/FormLabel';
import { OfferActionButton } from '@/components/ui/OfferActionButton';
import { IconEye, IconEyeOff } from '@/components/ui/icons/icons';
import { ProfilePreferencesCards } from '@/features/profile/ProfilePreferencesCards';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { ConsentChoice } from '@/lib/consent/types';
import type { AppMeDto } from '@/lib/api/dto/auth';

type Translate = (key: I18nKey) => string;

type PasswordField = 'currentPassword' | 'newPassword' | 'confirmPassword';

type ProfileSettingsSectionProps = {
  t: Translate;
  requiredHint: string;
  authMe: AppMeDto | null;

  avatarPreviewUrl: string | null;
  avatarInitial: string;
  isUploadingAvatar: boolean;
  avatarFileName: string;
  fileButtonLabel: string;
  noFileLabel: string;
  onAvatarSelected: (event: React.ChangeEvent<HTMLInputElement>) => void;

  profileForm: { name: string; city: string };
  isProfileEditing: boolean;
  isSavingProfile: boolean;
  onToggleProfileEditing: () => void;
  onProfileFieldChange: (field: 'name' | 'city', value: string) => void;
  onSaveProfile: () => void;
  onCancelProfile: () => void;

  isSecurityEditing: boolean;
  isSavingPassword: boolean;
  onToggleSecurityEditing: () => void;
  onSavePassword: () => void;
  onCancelSecurity: () => void;
  passwordForm: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  onPasswordFieldChange: (field: PasswordField, value: string) => void;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  onToggleShowCurrentPassword: () => void;
  onToggleShowNewPassword: () => void;
  onToggleShowConfirmPassword: () => void;
  passwordChecks: {
    length: boolean;
    upper: boolean;
    lower: boolean;
    digit: boolean;
    symbol: boolean;
  };
  isPasswordStrong: boolean;
  passwordsMatch: boolean;

  locale: Locale;
  setLocale: (locale: Locale) => void;
  effectiveTheme: string;
  setTheme: (theme: 'light' | 'dark') => void;
  favoritesTotal: number;
  consentChoice: ConsentChoice;
  openPreferences: () => void;
};

export function ProfileSettingsSection({
  t,
  requiredHint,
  authMe,
  avatarPreviewUrl,
  avatarInitial,
  isUploadingAvatar,
  avatarFileName,
  fileButtonLabel,
  noFileLabel,
  onAvatarSelected,
  profileForm,
  isProfileEditing,
  isSavingProfile,
  onToggleProfileEditing,
  onProfileFieldChange,
  onSaveProfile,
  onCancelProfile,
  isSecurityEditing,
  isSavingPassword,
  onToggleSecurityEditing,
  onSavePassword,
  onCancelSecurity,
  passwordForm,
  onPasswordFieldChange,
  showCurrentPassword,
  showNewPassword,
  showConfirmPassword,
  onToggleShowCurrentPassword,
  onToggleShowNewPassword,
  onToggleShowConfirmPassword,
  passwordChecks,
  isPasswordStrong,
  passwordsMatch,
  locale,
  setLocale,
  effectiveTheme,
  setTheme,
  favoritesTotal,
  consentChoice,
  openPreferences,
}: ProfileSettingsSectionProps) {
  return (
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
                    onChange={onAvatarSelected}
                    disabled={isUploadingAvatar}
                  />
                </label>
              </span>
              <div className="profile-settings__avatar-file">
                <p className="typo-small">
                  {isUploadingAvatar
                    ? t(I18N_KEYS.client.profilePhotoUploading)
                    : t(I18N_KEYS.client.profilePhotoFormatHint)}
                </p>
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
              onClick={onToggleProfileEditing}
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
              onChange={(event) => onProfileFieldChange('name', event.target.value)}
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
              onChange={(event) => onProfileFieldChange('city', event.target.value)}
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
                onClick={onSaveProfile}
                disabled={isSavingProfile}
              >
                {isSavingProfile ? t(I18N_KEYS.common.refreshing) : t(I18N_KEYS.client.profileSaveCta)}
              </button>
              <button
                type="button"
                className="btn-ghost profile-settings__text-action"
                onClick={onCancelProfile}
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
              onClick={onToggleSecurityEditing}
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
                  onChange={(event) => onPasswordFieldChange('currentPassword', event.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="profile-settings__password-toggle"
                  onClick={onToggleShowCurrentPassword}
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
                  onChange={(event) => onPasswordFieldChange('newPassword', event.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="profile-settings__password-toggle"
                  onClick={onToggleShowNewPassword}
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
                  onChange={(event) => onPasswordFieldChange('confirmPassword', event.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="profile-settings__password-toggle"
                  onClick={onToggleShowConfirmPassword}
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
                onClick={onSavePassword}
                disabled={isSavingPassword}
              >
                {isSavingPassword ? t(I18N_KEYS.common.refreshing) : t(I18N_KEYS.client.profileSaveCta)}
              </button>
              <button
                type="button"
                className="btn-ghost profile-settings__text-action"
                onClick={onCancelSecurity}
                disabled={isSavingPassword}
              >
                {t(I18N_KEYS.client.profileCancelCta)}
              </button>
            </div>
          ) : null}
        </article>

        <ProfilePreferencesCards
          t={t}
          locale={locale}
          setLocale={setLocale}
          effectiveTheme={effectiveTheme}
          setTheme={setTheme}
          favoritesTotal={favoritesTotal}
          consentChoice={consentChoice}
          openPreferences={openPreferences}
        />
      </div>
    </section>
  );
}
