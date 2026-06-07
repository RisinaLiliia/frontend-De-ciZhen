'use client';

import { Field } from '@/components/ui/Field';
import { FormLabel } from '@/components/ui/FormLabel';
import { Input } from '@/components/ui/Input';
import { IconEye, IconEyeOff } from '@/components/ui/icons/icons';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import type {
  ProfileOnboardingValues,
} from './workspaceProfileOnboarding.model';

type WorkspaceProfileOnboardingAccountSectionProps = {
  t: (key: I18nKey) => string;
  loading: boolean;
  requiredHint: string;
  showPassword: boolean;
  passwordToggleLabel: string;
  passwordChecks: {
    length: boolean;
    upper: boolean;
    lower: boolean;
    digit: boolean;
    symbol: boolean;
  };
  consentPrivacyHref: string;
  consentCookieHref: string;
  register: UseFormRegister<ProfileOnboardingValues>;
  errors: FieldErrors<ProfileOnboardingValues>;
  onToggleShowPassword: () => void;
};

export function WorkspaceProfileOnboardingAccountSection({
  t,
  loading,
  requiredHint,
  showPassword,
  passwordToggleLabel,
  passwordChecks,
  consentPrivacyHref,
  consentCookieHref,
  register,
  errors,
  onToggleShowPassword,
}: WorkspaceProfileOnboardingAccountSectionProps) {
  return (
    <>
      <section className="stack-sm">
        <div className="request-form__row is-2">
          <div className="form-group">
            <FormLabel htmlFor="workspace-profile-email" required requiredHint={requiredHint}>
              {t(I18N_KEYS.auth.emailLabel)}
            </FormLabel>
            <Field>
              <Input
                id="workspace-profile-email"
                type="email"
                autoComplete="email"
                aria-invalid={errors.email ? 'true' : 'false'}
                {...register('email')}
              />
            </Field>
            {errors.email ? <p className="auth-form-error">{errors.email.message}</p> : null}
          </div>

          <div className="form-group">
            <FormLabel htmlFor="workspace-profile-password" required requiredHint={requiredHint}>
              {t(I18N_KEYS.auth.passwordLabel)}
            </FormLabel>
            <Field className="profile-settings__password-field">
              <Input
                id="workspace-profile-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                aria-invalid={errors.password ? 'true' : 'false'}
                {...register('password')}
              />
              <button
                type="button"
                className="profile-settings__password-toggle"
                onClick={onToggleShowPassword}
                aria-label={passwordToggleLabel}
                title={passwordToggleLabel}
              >
                {showPassword ? <IconEye /> : <IconEyeOff />}
              </button>
            </Field>
            {errors.password ? <p className="auth-form-error">{errors.password.message}</p> : null}
          </div>
        </div>
        <div className="auth-password-rules">
          <span className={passwordChecks.length ? 'is-ok' : ''}>{t(I18N_KEYS.auth.passwordRuleLength)}</span>
          <span className={passwordChecks.upper ? 'is-ok' : ''}>{t(I18N_KEYS.auth.passwordRuleUpper)}</span>
          <span className={passwordChecks.lower ? 'is-ok' : ''}>{t(I18N_KEYS.auth.passwordRuleLower)}</span>
          <span className={passwordChecks.digit ? 'is-ok' : ''}>{t(I18N_KEYS.auth.passwordRuleDigit)}</span>
          <span className={passwordChecks.symbol ? 'is-ok' : ''}>{t(I18N_KEYS.auth.passwordRuleSymbol)}</span>
        </div>
      </section>

      <label className="workspace-profile-onboarding__consent">
        <input
          type="checkbox"
          disabled={loading}
          aria-invalid={errors.acceptPrivacyPolicy ? 'true' : 'false'}
          {...register('acceptPrivacyPolicy')}
        />
        <span className="auth-consent__text">
          {t(I18N_KEYS.auth.acceptPolicyPrefix)}{' '}
          <a href={consentPrivacyHref} target="_blank" rel="noopener noreferrer" className="auth-consent__link">
            {t(I18N_KEYS.auth.acceptPolicyPrivacyLink)}
          </a>{' '}
          {t(I18N_KEYS.auth.acceptPolicyAnd)}{' '}
          <a href={consentCookieHref} target="_blank" rel="noopener noreferrer" className="auth-consent__link">
            {t(I18N_KEYS.auth.acceptPolicyCookieLink)}
          </a>{' '}
          {t(I18N_KEYS.auth.acceptPolicySuffix)}
        </span>
      </label>
      {errors.acceptPrivacyPolicy ? <p className="auth-form-error">{errors.acceptPrivacyPolicy.message}</p> : null}

      <div className="workspace-profile-onboarding__actions">
        <button
          type="submit"
          className="auth-social__btn auth-social__btn--google"
          disabled={loading}
          aria-busy={loading || undefined}
        >
          {t(I18N_KEYS.provider.onboardingCta)}
        </button>
      </div>
    </>
  );
}
