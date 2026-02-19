'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { FormLabel } from '@/components/ui/FormLabel';
import { Input } from '@/components/ui/Input';
import { forgotPassword } from '@/lib/auth/api';
import { buildForgotPasswordSchema, type ForgotPasswordValues } from '@/features/auth/forgot-password.schema';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';

export function ForgotPasswordForm() {
  const t = useT();
  const searchParams = useSearchParams();
  const requiredHint = t(I18N_KEYS.common.requiredFieldHint);
  const schema = React.useMemo(() => buildForgotPasswordSchema(t), [t]);

  const initialEmail = searchParams.get('email')?.trim() ?? '';
  const nextPath = searchParams.get('next')?.trim();
  const loginHref = React.useMemo(() => {
    if (!nextPath || !nextPath.startsWith('/')) return '/auth/login';
    return `/auth/login?next=${encodeURIComponent(nextPath)}`;
  }, [nextPath]);

  const [done, setDone] = React.useState(false);
  const [resetUrl, setResetUrl] = React.useState<string | undefined>(undefined);

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: initialEmail },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    try {
      const result = await forgotPassword({
        email: values.email.trim().toLowerCase(),
        ...(nextPath && nextPath.startsWith('/') ? { nextPath } : {}),
      });
      setDone(true);
      setResetUrl(result.resetUrl);
    } catch {
      toast.error(t(I18N_KEYS.auth.errorGenericLogin));
    }
  };

  React.useEffect(() => {
    if (errors.email) setFocus('email');
  }, [errors.email, setFocus]);

  return (
    <form className="form-stack" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-group">
        <FormLabel htmlFor="forgot-email" required requiredHint={requiredHint}>
          {t(I18N_KEYS.auth.emailLabel)}
        </FormLabel>
        <Field>
          <Input
            id="forgot-email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'forgot-email-error' : undefined}
            {...register('email')}
          />
        </Field>
        {errors.email ? <p id="forgot-email-error" className="auth-form-error" role="alert">{errors.email.message}</p> : null}
      </div>

      {done ? (
        <div className="auth-form-note" role="status" aria-live="polite">
          <p>{t(I18N_KEYS.auth.forgotPasswordEmailSent)}</p>
          {resetUrl ? (
            <a href={resetUrl} className="typo-small link-accent">
              {t(I18N_KEYS.auth.forgotPasswordOpenReset)}
            </a>
          ) : null}
        </div>
      ) : null}

      <Button type="submit" loading={isSubmitting}>
        {t(I18N_KEYS.auth.forgotPasswordCta)}
      </Button>

      <Link href={loginHref} prefetch={false} className="typo-small text-center link-accent">
        {t(I18N_KEYS.auth.toLogin)}
      </Link>
    </form>
  );
}
