// src/features/auth/LoginForm.tsx
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
import { useAuthLogin, useAuthStatus } from '@/hooks/useAuthSnapshot';
import { buildLoginSchema, type LoginValues } from '@/features/auth/login.schema';
import { getLoginErrorMessage, isInvalidCredentialsError } from '@/features/auth/mapAuthError';
import { SocialAuthButtons } from '@/features/auth/SocialAuthButtons';
import { resolveSafeNext } from '@/features/auth/navigation';
import { useAuthSuccessNavigate } from '@/features/auth/useAuthSuccessNavigate';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';

export function LoginForm() {
  const t = useT();
  const searchParams = useSearchParams();
  const next = resolveSafeNext(searchParams.get('next'));
  const oauthError = searchParams.get('error');
  const registerHref = `/auth/register?next=${encodeURIComponent(next)}`;
  const [showPassword, setShowPassword] = React.useState(false);
  const requiredHint = t(I18N_KEYS.common.requiredFieldHint);
  const schema = React.useMemo(() => buildLoginSchema(t), [t]);

  const login = useAuthLogin();
  const status = useAuthStatus();
  const navigateAfterAuth = useAuthSuccessNavigate(next);

  const {
    register,
    handleSubmit,
    control,
    setFocus,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });
  const watchedEmail = useWatch({ control, name: 'email' }) ?? '';
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watchedEmail);

  const onSubmit = async (values: LoginValues) => {
    try {
      await login(values.email, values.password);
      toast.success(t(I18N_KEYS.auth.loginSuccess));
      navigateAfterAuth();
    } catch (error) {
      const message = getLoginErrorMessage(error, t);
      if (isInvalidCredentialsError(error)) {
        setError('email', { type: 'server', message });
        setError('password', { type: 'server', message });
      }
      toast.error(message);
    }
  };

  const loading = isSubmitting || status === 'loading';

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
    if (errors.email) {
      setFocus('email');
      return;
    }
    if (errors.password) {
      setFocus('password');
    }
  }, [errors.email, errors.password, setFocus]);

  const errorSummary = errors.email?.message || errors.password?.message || '';

  return (
    <form className="form-stack" onSubmit={handleSubmit(onSubmit)} noValidate>
      <p className="sr-only" aria-live="polite">{errorSummary}</p>
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
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            {...register('email')}
          />
        </Field>
        {errors.email ? <p id="login-email-error" className="auth-form-error" role="alert">{errors.email.message}</p> : null}
      </div>

      <div className="form-group">
        <FormLabel htmlFor="password" required requiredHint={requiredHint}>
          {t(I18N_KEYS.auth.passwordLabel)}
        </FormLabel>
        <Field className="profile-settings__password-field">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
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
        {errors.password ? (
          <p id="login-password-error" className="auth-form-error" role="alert">{errors.password.message}</p>
        ) : null}
      </div>

      <Button type="submit" loading={loading}>
        {t(I18N_KEYS.auth.loginCta)}
      </Button>

      <SocialAuthButtons nextPath={next} />

      <Link href={registerHref} prefetch={false} className="typo-small text-center link-accent">
        {t(I18N_KEYS.auth.toRegister)}
      </Link>
    </form>
  );
}
