// src/features/auth/LoginForm.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { useAuthLogin, useAuthStatus } from '@/hooks/useAuthSnapshot';
import { loginSchema, type LoginValues } from '@/features/auth/login.schema';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { ApiError } from '@/lib/api/http-error';

export function LoginForm() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';
  const role = searchParams.get('role');
  const registerHref = `/auth/register?next=${encodeURIComponent(next)}${
    role ? `&role=${encodeURIComponent(role)}` : ''
  }`;
  const showNextHint = next && next !== '/';

  const login = useAuthLogin();
  const status = useAuthStatus();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      await login(values.email, values.password);
      router.replace(next);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Login failed';
      toast.error(message);
    }
  };

  const loading = isSubmitting || status === 'loading';

  React.useEffect(() => {
    if (status === 'authenticated') {
      router.replace(next);
    }
  }, [status, next, router]);

  return (
    <form className="form-stack" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-group">
        <label className="typo-small" htmlFor="email">
          {t(I18N_KEYS.auth.emailLabel)}
        </label>
        <Field>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
          />
        </Field>
        {errors.email ? <p className="text-red-600 text-sm">{errors.email.message}</p> : null}
      </div>

      <div className="form-group">
        <label className="typo-small" htmlFor="password">
          {t(I18N_KEYS.auth.passwordLabel)}
        </label>
        <Field>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
          />
        </Field>
        {errors.password ? (
          <p className="text-red-600 text-sm">{errors.password.message}</p>
        ) : null}
      </div>

      <Button type="submit" loading={loading}>
        {t(I18N_KEYS.auth.loginCta)}
      </Button>

      {showNextHint ? (
        <p className="typo-small text-center">{t(I18N_KEYS.auth.nextHint)}</p>
      ) : null}

      <Link href={registerHref} className="typo-small text-center link-accent">
        {t(I18N_KEYS.auth.toRegister)}
      </Link>
    </form>
  );
}
