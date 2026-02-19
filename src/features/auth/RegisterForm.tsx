// src/features/auth/RegisterForm.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { FormLabel } from '@/components/ui/FormLabel';
import { Input } from '@/components/ui/Input';
import { IconCheck, IconEye, IconEyeOff } from '@/components/ui/icons/icons';
import { useAuthRegister, useAuthStatus } from '@/hooks/useAuthSnapshot';
import { buildRegisterSchema, type RegisterValues } from '@/features/auth/register.schema';
import { getRegisterErrorMessage, isEmailExistsError } from '@/features/auth/mapAuthError';
import { SocialAuthButtons } from '@/features/auth/SocialAuthButtons';
import { resolveSafeNext } from '@/features/auth/navigation';
import { useAuthSuccessNavigate } from '@/features/auth/useAuthSuccessNavigate';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';

export function RegisterForm() {
  const t = useT();
  const searchParams = useSearchParams();
  const next = resolveSafeNext(searchParams.get('next'));
  const oauthError = searchParams.get('error');
  const oauthSignupToken = searchParams.get('signupToken') || '';
  const loginHref = `/auth/login?next=${encodeURIComponent(next)}`;
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const requiredHint = t(I18N_KEYS.common.requiredFieldHint);
  const schema = React.useMemo(() => buildRegisterSchema(t), [t]);

  const registerUser = useAuthRegister();
  const status = useAuthStatus();
  const navigateAfterAuth = useAuthSuccessNavigate(next);

  const {
    register,
    handleSubmit,
    control,
    setFocus,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptPrivacyPolicy: false,
    },
  });

  const onSubmit = async (values: RegisterValues) => {
    try {
      const { confirmPassword, ...payload } = values;
      void confirmPassword;
      await registerUser({ ...payload, ...(oauthSignupToken ? { signupToken: oauthSignupToken } : {}) });
      toast.success(t(I18N_KEYS.auth.registerSuccess));
      navigateAfterAuth();
    } catch (error) {
      const message = getRegisterErrorMessage(error, t);
      if (isEmailExistsError(error)) {
        setError('email', { type: 'server', message });
      }
      toast.error(message);
    }
  };

  const loading = isSubmitting || status === 'loading';
  const watchedPassword = useWatch({ control, name: 'password' }) ?? '';
  const watchedName = useWatch({ control, name: 'name' }) ?? '';
  const watchedEmail = useWatch({ control, name: 'email' }) ?? '';
  const passwordChecks = React.useMemo(
    () => ({
      length: watchedPassword.length >= 8,
      upper: /[A-ZА-ЯЁ]/.test(watchedPassword),
      lower: /[a-zа-яё]/.test(watchedPassword),
      digit: /\d/.test(watchedPassword),
      symbol: /[^A-Za-zА-Яа-яЁё0-9]/.test(watchedPassword),
    }),
    [watchedPassword],
  );
  const isNameValid = watchedName.trim().length >= 2;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watchedEmail);

  React.useEffect(() => {
    if (status === 'authenticated') {
      navigateAfterAuth();
    }
  }, [navigateAfterAuth, status]);

  React.useEffect(() => {
    if (!oauthError) return;
    if (oauthError === 'oauth_unavailable') {
      toast.error(t(I18N_KEYS.auth.oauthUnavailable));
      return;
    }
    if (oauthError === 'oauth_failed') {
      toast.error(t(I18N_KEYS.auth.oauthFailed));
      return;
    }
    if (oauthError === 'oauth_consent_required') {
      toast.message(t(I18N_KEYS.auth.oauthConsentRequired));
    }
  }, [oauthError, t]);

  React.useEffect(() => {
    if (errors.name) {
      setFocus('name');
      return;
    }
    if (errors.email) {
      setFocus('email');
      return;
    }
    if (errors.password) {
      setFocus('password');
      return;
    }
    if (errors.confirmPassword) {
      setFocus('confirmPassword');
      return;
    }
    if (errors.acceptPrivacyPolicy) {
      setFocus('acceptPrivacyPolicy');
    }
  }, [
    errors.acceptPrivacyPolicy,
    errors.confirmPassword,
    errors.email,
    errors.name,
    errors.password,
    setFocus,
  ]);

  const consentPrivacyHref = process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL?.trim() || '';
  const consentCookieHref = process.env.NEXT_PUBLIC_COOKIE_NOTICE_URL?.trim() || '';
  const errorSummary =
    errors.name?.message ||
    errors.email?.message ||
    errors.password?.message ||
    errors.confirmPassword?.message ||
    errors.acceptPrivacyPolicy?.message ||
    '';

  return (
    <form className="form-stack" onSubmit={handleSubmit(onSubmit)} noValidate>
      <p className="sr-only" aria-live="polite">{errorSummary}</p>
      <div className="form-group">
        <FormLabel htmlFor="name" required requiredHint={requiredHint}>
          {t(I18N_KEYS.auth.nameLabel)}
        </FormLabel>
        <Field
          rightIcon={
            isNameValid && !errors.name ? (
              <span className="auth-valid-icon">
                <IconCheck />
              </span>
            ) : null
          }
        >
          <Input
            id="name"
            autoComplete="name"
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'register-name-error' : undefined}
            {...register('name')}
          />
        </Field>
        {errors.name ? <p id="register-name-error" className="auth-form-error" role="alert">{errors.name.message}</p> : null}
      </div>

      <div className="form-group">
        <FormLabel htmlFor="email" required requiredHint={requiredHint}>
          {t(I18N_KEYS.auth.emailLabel)}
        </FormLabel>
        <Field
          rightIcon={
            isEmailValid && !errors.email ? (
              <span className="auth-valid-icon">
                <IconCheck />
              </span>
            ) : null
          }
        >
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'register-email-error' : undefined}
            {...register('email')}
          />
        </Field>
        {errors.email ? <p id="register-email-error" className="auth-form-error" role="alert">{errors.email.message}</p> : null}
      </div>

      <div className="form-group">
        <FormLabel htmlFor="password" required requiredHint={requiredHint}>
          {t(I18N_KEYS.auth.passwordLabel)}
        </FormLabel>
        <Field className="profile-settings__password-field">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'register-password-error' : undefined}
            {...register('password')}
          />
          <button
            type="button"
            className="profile-settings__password-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Passwort ausblenden' : 'Passwort anzeigen'}
            title={showPassword ? 'Passwort ausblenden' : 'Passwort anzeigen'}
          >
            {showPassword ? <IconEye /> : <IconEyeOff />}
          </button>
        </Field>
        {errors.password ? <p id="register-password-error" className="auth-form-error" role="alert">{errors.password.message}</p> : null}
        <div className="auth-password-rules">
          <span className={passwordChecks.length ? 'is-ok' : ''}>{t(I18N_KEYS.auth.passwordRuleLength)}</span>
          <span className={passwordChecks.upper ? 'is-ok' : ''}>{t(I18N_KEYS.auth.passwordRuleUpper)}</span>
          <span className={passwordChecks.lower ? 'is-ok' : ''}>{t(I18N_KEYS.auth.passwordRuleLower)}</span>
          <span className={passwordChecks.digit ? 'is-ok' : ''}>{t(I18N_KEYS.auth.passwordRuleDigit)}</span>
          <span className={passwordChecks.symbol ? 'is-ok' : ''}>{t(I18N_KEYS.auth.passwordRuleSymbol)}</span>
        </div>
      </div>

      <div className="form-group">
        <FormLabel htmlFor="confirmPassword" required requiredHint={requiredHint}>
          {t(I18N_KEYS.auth.confirmPasswordLabel)}
        </FormLabel>
        <Field className="profile-settings__password-field">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            aria-invalid={errors.confirmPassword ? 'true' : 'false'}
            aria-describedby={errors.confirmPassword ? 'register-confirm-password-error' : undefined}
            {...register('confirmPassword')}
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
        </Field>
        {errors.confirmPassword ? <p id="register-confirm-password-error" className="auth-form-error" role="alert">{errors.confirmPassword.message}</p> : null}
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          aria-invalid={errors.acceptPrivacyPolicy ? 'true' : 'false'}
          aria-describedby={errors.acceptPrivacyPolicy ? 'register-consent-error' : undefined}
          {...register('acceptPrivacyPolicy')}
        />
        <span className="auth-consent__text">
          {t(I18N_KEYS.auth.acceptPolicyPrefix)}{' '}
          {consentPrivacyHref ? (
            <a href={consentPrivacyHref} target="_blank" rel="noopener noreferrer" className="auth-consent__link">
              {t(I18N_KEYS.auth.acceptPolicyPrivacyLink)}
            </a>
          ) : (
            <span className="auth-consent__link is-disabled">{t(I18N_KEYS.auth.acceptPolicyPrivacyLink)}</span>
          )}{' '}
          {t(I18N_KEYS.auth.acceptPolicyAnd)}{' '}
          {consentCookieHref ? (
            <a href={consentCookieHref} target="_blank" rel="noopener noreferrer" className="auth-consent__link">
              {t(I18N_KEYS.auth.acceptPolicyCookieLink)}
            </a>
          ) : (
            <span className="auth-consent__link is-disabled">{t(I18N_KEYS.auth.acceptPolicyCookieLink)}</span>
          )}{' '}
          {t(I18N_KEYS.auth.acceptPolicySuffix)}
        </span>
      </label>
      {errors.acceptPrivacyPolicy ? (
        <p id="register-consent-error" className="auth-form-error" role="alert">{errors.acceptPrivacyPolicy.message}</p>
      ) : null}

      <Button type="submit" loading={loading}>
        {t(I18N_KEYS.auth.registerCta)}
      </Button>

      <SocialAuthButtons nextPath={next} />

      <Link href={loginHref} prefetch={false} className="typo-small text-center link-accent">
        {t(I18N_KEYS.auth.toLogin)}
      </Link>
    </form>
  );
}
