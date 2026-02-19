'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { FormLabel } from '@/components/ui/FormLabel';
import { Input } from '@/components/ui/Input';
import { IconEye, IconEyeOff } from '@/components/ui/icons/icons';
import { resetPassword } from '@/lib/auth/api';
import { buildResetPasswordSchema, type ResetPasswordValues } from '@/features/auth/reset-password.schema';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';

export function ResetPasswordForm() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const loginHref = '/auth/login';
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const requiredHint = t(I18N_KEYS.common.requiredFieldHint);
  const schema = React.useMemo(() => buildResetPasswordSchema(t), [t]);

  const {
    register,
    handleSubmit,
    control,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const watchedPassword = useWatch({ control, name: 'password' }) ?? '';
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

  const onSubmit = async (values: ResetPasswordValues) => {
    if (!token) {
      toast.error(t(I18N_KEYS.auth.resetPasswordTokenMissing));
      return;
    }

    try {
      await resetPassword({ token, password: values.password });
      toast.success(t(I18N_KEYS.auth.resetPasswordSuccess));
      router.replace(loginHref);
    } catch {
      toast.error(t(I18N_KEYS.auth.resetPasswordInvalidToken));
    }
  };

  React.useEffect(() => {
    if (errors.password) {
      setFocus('password');
      return;
    }
    if (errors.confirmPassword) {
      setFocus('confirmPassword');
    }
  }, [errors.confirmPassword, errors.password, setFocus]);

  const errorSummary = errors.password?.message || errors.confirmPassword?.message || '';

  return (
    <form className="form-stack" onSubmit={handleSubmit(onSubmit)} noValidate>
      <p className="sr-only" aria-live="polite">{errorSummary}</p>

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
            aria-describedby={errors.password ? 'reset-password-error' : undefined}
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
        {errors.password ? <p id="reset-password-error" className="auth-form-error" role="alert">{errors.password.message}</p> : null}
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
            aria-describedby={errors.confirmPassword ? 'reset-confirm-password-error' : undefined}
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
        {errors.confirmPassword ? <p id="reset-confirm-password-error" className="auth-form-error" role="alert">{errors.confirmPassword.message}</p> : null}
      </div>

      <Button type="submit" loading={isSubmitting} disabled={!token}>
        {t(I18N_KEYS.auth.resetPasswordCta)}
      </Button>

      <Link href={loginHref} prefetch={false} className="typo-small text-center link-accent">
        {t(I18N_KEYS.auth.toLogin)}
      </Link>
    </form>
  );
}
