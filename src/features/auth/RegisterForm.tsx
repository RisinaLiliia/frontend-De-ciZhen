// src/features/auth/RegisterForm.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useAuthRegister, useAuthStatus } from '@/hooks/useAuthSnapshot';
import { registerSchema, type RegisterValues } from '@/features/auth/register.schema';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { ApiError } from '@/lib/api/http-error';

const DEFAULT_AUTH_NEXT = '/requests?sort=date_desc&page=1&limit=20';

export function RegisterForm() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || DEFAULT_AUTH_NEXT;
  const roleFromQuery = searchParams.get('role') as RegisterValues['role'] | null;
  const loginHref = `/auth/login?next=${encodeURIComponent(next)}${
    roleFromQuery ? `&role=${encodeURIComponent(roleFromQuery)}` : ''
  }`;
  const roleHint =
    roleFromQuery === 'provider'
      ? t(I18N_KEYS.landing.providerDesc)
      : roleFromQuery === 'client'
        ? t(I18N_KEYS.landing.clientDesc)
        : '';
  const showNextHint = next && next !== DEFAULT_AUTH_NEXT;

  const registerUser = useAuthRegister();
  const status = useAuthStatus();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: roleFromQuery ?? undefined,
      city: '',
      language: '',
      acceptPrivacyPolicy: false,
    },
  });

  const onSubmit = async (values: RegisterValues) => {
    try {
      await registerUser(values);
      router.replace(next);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Registration failed';
      toast.error(message);
    }
  };

  const loading = isSubmitting || status === 'loading';
  const role = useWatch({ control, name: 'role' });

  React.useEffect(() => {
    if (status === 'authenticated') {
      router.replace(next);
    }
  }, [status, next, router]);

  return (
    <form className="form-stack" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-group">
        <label className="typo-small" htmlFor="name">
          {t(I18N_KEYS.auth.nameLabel)}
        </label>
        <Field>
          <Input id="name" autoComplete="name" {...register('name')} />
        </Field>
        {errors.name ? <p className="text-red-600 text-sm">{errors.name.message}</p> : null}
      </div>

      <div className="form-group">
        <label className="typo-small" htmlFor="email">
          {t(I18N_KEYS.auth.emailLabel)}
        </label>
        <Field>
          <Input id="email" type="email" autoComplete="email" {...register('email')} />
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
            autoComplete="new-password"
            {...register('password')}
          />
        </Field>
        {errors.password ? <p className="text-red-600 text-sm">{errors.password.message}</p> : null}
      </div>

      <div className="form-group">
        <label className="typo-small" htmlFor="role">
          {t(I18N_KEYS.auth.roleLabel)}
        </label>
        <Field>
          <Select
            aria-label={t(I18N_KEYS.auth.roleLabel)}
            value={role ?? ''}
            onChange={(value) =>
              setValue('role', value ? (value as RegisterValues['role']) : undefined)
            }
            options={[
              { value: '', label: t(I18N_KEYS.auth.roleLabel) },
              { value: 'client', label: t(I18N_KEYS.auth.roleClient) },
              { value: 'provider', label: t(I18N_KEYS.auth.roleProvider) },
            ]}
          />
        </Field>
        {errors.role ? <p className="text-red-600 text-sm">{errors.role.message}</p> : null}
      </div>

      <div className="form-group">
        <label className="typo-small" htmlFor="city">
          {t(I18N_KEYS.auth.cityLabel)}
        </label>
        <Field>
          <Input id="city" autoComplete="address-level2" {...register('city')} />
        </Field>
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" className="mt-1" {...register('acceptPrivacyPolicy')} />
        <span>{t(I18N_KEYS.auth.acceptPolicy)}</span>
      </label>
      {errors.acceptPrivacyPolicy ? (
        <p className="text-red-600 text-sm">{errors.acceptPrivacyPolicy.message}</p>
      ) : null}

      <Button type="submit" loading={loading}>
        {t(I18N_KEYS.auth.registerCta)}
      </Button>

      {showNextHint ? <p className="typo-small text-center">{t(I18N_KEYS.auth.nextHint)}</p> : null}

      {roleHint ? <p className="typo-small text-center">{roleHint}</p> : null}

      <Link href={loginHref} className="typo-small text-center link-accent">
        {t(I18N_KEYS.auth.toLogin)}
      </Link>
    </form>
  );
}
