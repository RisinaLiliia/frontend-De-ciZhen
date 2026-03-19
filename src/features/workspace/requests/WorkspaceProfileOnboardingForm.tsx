'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { Field } from '@/components/ui/Field';
import { FormLabel } from '@/components/ui/FormLabel';
import { Input } from '@/components/ui/Input';
import { Select, type Option } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { IconCamera, IconEye, IconEyeOff } from '@/components/ui/icons/icons';
import { useCities, useServiceCategories, useServices } from '@/features/catalog/queries';
import { getRegisterErrorMessage, isEmailExistsError } from '@/features/auth/mapAuthError';
import { useAuthRegister, useAuthSetLastMode, useAuthStatus } from '@/hooks/useAuthSnapshot';
import { updateMyProviderProfile } from '@/lib/api/providers';
import { updateMe, uploadMyAvatar } from '@/lib/api/users';
import { pickI18n } from '@/lib/i18n/helpers';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useT } from '@/lib/i18n/useT';

type ProfileOnboardingValues = {
  name: string;
  cityId: string;
  categoryKey: string;
  description: string;
  email: string;
  password: string;
  acceptPrivacyPolicy: boolean;
};

function buildProfileOnboardingSchema(t: (key: I18nKey) => string) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, t(I18N_KEYS.auth.errorNameRequired))
      .min(2, t(I18N_KEYS.auth.errorNameMin))
      .max(50, t(I18N_KEYS.auth.errorNameMin)),
    cityId: z.string().trim().min(1, t(I18N_KEYS.requestsPage.profileOnboardingCityRequired)),
    categoryKey: z.string().trim(),
    description: z.string().trim().max(500, t(I18N_KEYS.requestsPage.profileOnboardingDescriptionMax)),
    email: z
      .string()
      .trim()
      .min(1, t(I18N_KEYS.auth.errorEmailRequired))
      .max(100, t(I18N_KEYS.auth.errorEmailInvalid))
      .email(t(I18N_KEYS.auth.errorEmailInvalid)),
    password: z
      .string()
      .min(1, t(I18N_KEYS.auth.errorPasswordRequired))
      .min(8, t(I18N_KEYS.auth.errorPasswordMin))
      .max(64, t(I18N_KEYS.auth.errorPasswordMin))
      .regex(/[A-ZА-ЯЁ]/, t(I18N_KEYS.auth.passwordRuleUpper))
      .regex(/[a-zа-яё]/, t(I18N_KEYS.auth.passwordRuleLower))
      .regex(/\d/, t(I18N_KEYS.auth.passwordRuleDigit))
      .regex(/[^A-Za-zА-Яа-яЁё0-9]/, t(I18N_KEYS.auth.passwordRuleSymbol)),
    acceptPrivacyPolicy: z.boolean().refine((value) => value === true, t(I18N_KEYS.auth.errorAcceptPolicyRequired)),
  });
}

export function WorkspaceProfileOnboardingForm() {
  const t = useT();
  const { locale } = useI18n();
  const router = useRouter();
  const status = useAuthStatus();
  const registerUser = useAuthRegister();
  const setLastMode = useAuthSetLastMode();

  const {
    data: cities = [],
    isLoading: isCitiesLoading,
    isError: isCitiesError,
  } = useCities('DE');
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useServiceCategories();
  const {
    data: services = [],
  } = useServices();

  const schema = React.useMemo(() => buildProfileOnboardingSchema(t), [t]);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmittingFlow, setIsSubmittingFlow] = React.useState(false);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = React.useState<string | null>(null);
  const avatarInputRef = React.useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileOnboardingValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      cityId: '',
      categoryKey: '',
      description: '',
      email: '',
      password: '',
      acceptPrivacyPolicy: false,
    },
  });

  const consentPrivacyHref = process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL?.trim() || '/privacy-policy';
  const consentCookieHref = process.env.NEXT_PUBLIC_COOKIE_NOTICE_URL?.trim() || '/cookie-notice';
  const requiredHint = t(I18N_KEYS.common.requiredFieldHint);
  const loading = isSubmitting || isSubmittingFlow || status === 'loading';
  const passwordToggleLabel = showPassword
    ? t(I18N_KEYS.client.profilePasswordHide)
    : t(I18N_KEYS.client.profilePasswordShow);
  const nameValue = watch('name');
  const cityIdValue = watch('cityId');
  const categoryKeyValue = watch('categoryKey');
  const passwordValue = watch('password') ?? '';
  const descriptionValue = watch('description');
  const descriptionLength = descriptionValue?.length ?? 0;
  const avatarInitial = (nameValue?.trim().charAt(0) || 'U').toUpperCase();
  const avatarActionLabel = avatarPreviewUrl
    ? t(I18N_KEYS.client.profilePhotoChangeAction)
    : t(I18N_KEYS.client.profilePhotoAddAction);
  const cityOptions = React.useMemo<Option[]>(
    () =>
      cities
        .slice()
        .sort((a, b) => pickI18n(a.i18n, locale).localeCompare(pickI18n(b.i18n, locale), locale))
        .map((city) => ({
          value: city.id,
          label: pickI18n(city.i18n, locale) || city.key,
        })),
    [cities, locale],
  );
  const categoryOptions = React.useMemo<Option[]>(
    () =>
      categories
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((category) => ({
          value: category.key,
          label: pickI18n(category.i18n, locale) || category.key,
        })),
    [categories, locale],
  );
  const passwordChecks = React.useMemo(
    () => ({
      length: passwordValue.length >= 8,
      upper: /[A-ZА-ЯЁ]/.test(passwordValue),
      lower: /[a-zа-яё]/.test(passwordValue),
      digit: /\d/.test(passwordValue),
      symbol: /[^A-Za-zА-Яа-яЁё0-9]/.test(passwordValue),
    }),
    [passwordValue],
  );

  React.useEffect(
    () => () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    },
    [avatarPreviewUrl],
  );

  const onAvatarSelected = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;

    setAvatarFile(file);
    setAvatarPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, []);

  const openAvatarPicker = React.useCallback(() => {
    avatarInputRef.current?.click();
  }, []);

  const onAvatarClear = React.useCallback(() => {
    setAvatarFile(null);
    setAvatarPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  const onSubmit = React.useCallback(
    async (values: ProfileOnboardingValues) => {
      const selectedCity = cities.find((city) => city.id === values.cityId);
      const selectedCategoryServiceKeys = values.categoryKey
        ? services
            .filter((service) => service.categoryKey === values.categoryKey)
            .map((service) => service.key)
        : [];

      if (!selectedCity) {
        toast.error(t(I18N_KEYS.requestsPage.profileOnboardingCityRequired));
        return;
      }

      const cityLabel = pickI18n(selectedCity.i18n, locale) || selectedCity.key;
      const description = values.description.trim();

      setIsSubmittingFlow(true);
      try {
        await registerUser({
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
          city: cityLabel,
          role: 'provider',
          acceptPrivacyPolicy: values.acceptPrivacyPolicy,
        });

        await Promise.all([
          updateMe({
            name: values.name.trim(),
            city: cityLabel,
            bio: description || undefined,
          }),
          updateMyProviderProfile({
            displayName: values.name.trim(),
            bio: description || undefined,
            cityId: values.cityId,
            ...(selectedCategoryServiceKeys.length > 0 ? { serviceKeys: selectedCategoryServiceKeys } : {}),
          }),
        ]);
        if (avatarFile) {
          try {
            await uploadMyAvatar(avatarFile);
          } catch {
            toast.error(t(I18N_KEYS.common.loadErrorShort));
          }
        }

        setLastMode('provider');
        toast.success(t(I18N_KEYS.requestsPage.profileOnboardingSuccess));
        router.replace('/workspace?tab=my-offers');
        router.refresh();
      } catch (error) {
        const message = getRegisterErrorMessage(error, t);
        if (isEmailExistsError(error)) {
          setError('email', { type: 'server', message: t(I18N_KEYS.auth.errorEmailExists) });
        }
        toast.error(message);
      } finally {
        setIsSubmittingFlow(false);
      }
    },
    [avatarFile, cities, locale, registerUser, router, services, setError, setLastMode, t],
  );

  if (status === 'authenticated') {
    return (
      <article className="card stack-sm workspace-profile-onboarding workspace-profile-onboarding--ready" role="status">
        <p className="typo-h3">{t(I18N_KEYS.provider.profileTitle)}</p>
        <p className="typo-small">{t(I18N_KEYS.requestsPage.profileOnboardingAuthedHint)}</p>
        <Link href="/profile" prefetch={false} className="btn-primary requests-primary-cta">
          {t(I18N_KEYS.requestsPage.profileOnboardingAuthedCta)}
        </Link>
      </article>
    );
  }

  return (
    <article className="card stack-md workspace-profile-onboarding" aria-labelledby="workspace-profile-onboarding-title">
      <header className="stack-sm">
        <span className="status-badge status-badge--info workspace-profile-onboarding__step">
          {t(I18N_KEYS.requestsPage.profileOnboardingStep)}
        </span>
        <h2 id="workspace-profile-onboarding-title" className="typo-h3">
          {t(I18N_KEYS.provider.onboardingTitle)}
        </h2>
        <p className="typo-small">{t(I18N_KEYS.requestsPage.profileOnboardingSubtitle)}</p>
      </header>

      <form className="workspace-profile-onboarding__form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <section className="stack-sm">
          <div className="form-group">
            <FormLabel>{t(I18N_KEYS.client.profilePhotoTitle)}</FormLabel>
            <div className="workspace-profile-onboarding__avatar-stack">
              <button
                type="button"
                className={`profile-settings__avatar ${avatarPreviewUrl ? '' : 'profile-settings__avatar--placeholder'}`.trim()}
                onClick={openAvatarPicker}
                aria-label={avatarActionLabel}
                title={avatarActionLabel}
                disabled={loading}
              >
                {avatarPreviewUrl ? (
                  <Image src={avatarPreviewUrl} alt={t(I18N_KEYS.client.profileAvatarAlt)} width={64} height={64} />
                ) : (
                  avatarInitial
                )}
                <span className="profile-settings__avatar-edit" aria-hidden="true">
                  <span className="workspace-profile-onboarding__avatar-badge">
                    <IconCamera />
                  </span>
                </span>
                <span className="workspace-profile-onboarding__avatar-overlay">{avatarActionLabel}</span>
              </button>
              <div className="profile-settings__avatar-file">
                <button
                  type="button"
                  className="workspace-profile-onboarding__avatar-action"
                  onClick={openAvatarPicker}
                  disabled={loading}
                >
                  {avatarActionLabel}
                </button>
                {avatarPreviewUrl ? (
                  <button
                    type="button"
                    className="workspace-profile-onboarding__avatar-action workspace-profile-onboarding__avatar-action--danger"
                    onClick={onAvatarClear}
                    disabled={loading}
                  >
                    {t(I18N_KEYS.request.removePhoto)}
                  </button>
                ) : null}
                <p className="typo-small">{t(I18N_KEYS.client.profilePhotoFormatHint)}</p>
              </div>
            </div>
            <input
              id="workspace-profile-avatar"
              ref={avatarInputRef}
              className="sr-only"
              type="file"
              accept="image/*"
              onChange={onAvatarSelected}
              disabled={loading}
            />
          </div>
          <div className="request-form__row is-2">
            <div className="form-group">
              <FormLabel htmlFor="workspace-profile-name" required requiredHint={requiredHint}>
                {t(I18N_KEYS.auth.nameLabel)}
              </FormLabel>
              <Field>
                <Input
                  id="workspace-profile-name"
                  autoComplete="name"
                  aria-invalid={errors.name ? 'true' : 'false'}
                  {...register('name')}
                />
              </Field>
              {errors.name ? <p className="auth-form-error">{errors.name.message}</p> : null}
            </div>

            <div className="form-group">
              <FormLabel htmlFor="workspace-profile-city" required requiredHint={requiredHint}>
                {t(I18N_KEYS.provider.city)}
              </FormLabel>
              <Field>
                <Select
                  id="workspace-profile-city"
                  options={cityOptions}
                  value={cityIdValue || undefined}
                  onChange={(value) => {
                    setValue('cityId', value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                  placeholder={isCitiesLoading ? t(I18N_KEYS.common.refreshing) : '—'}
                  disabled={isCitiesLoading || isCitiesError || loading}
                  aria-label={t(I18N_KEYS.requestsPage.cityLabel)}
                />
                <input type="hidden" {...register('cityId')} />
              </Field>
              {errors.cityId ? <p className="auth-form-error">{errors.cityId.message}</p> : null}
            </div>
          </div>

          <div className="form-group">
            <FormLabel htmlFor="workspace-profile-service">
              {t(I18N_KEYS.requestsPage.categoryLabel)}
            </FormLabel>
            <Field>
              <Select
                id="workspace-profile-service"
                options={categoryOptions}
                value={categoryKeyValue || undefined}
                onChange={(value) => {
                  setValue('categoryKey', value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                placeholder={isCategoriesLoading ? t(I18N_KEYS.common.refreshing) : t(I18N_KEYS.request.categoryPlaceholder)}
                disabled={isCategoriesLoading || isCategoriesError || loading}
                aria-label={t(I18N_KEYS.requestsPage.categoryLabel)}
              />
              <input type="hidden" {...register('categoryKey')} />
            </Field>
          </div>
        </section>

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
                  onClick={() => setShowPassword((prev) => !prev)}
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

        <div className="form-group">
          <div className="request-form__meta">
            <FormLabel htmlFor="workspace-profile-description">
              {t(I18N_KEYS.provider.bio)}
            </FormLabel>
            <span className="form-counter">{descriptionLength}/500</span>
          </div>
          <Textarea
            id="workspace-profile-description"
            maxLength={500}
            aria-invalid={errors.description ? 'true' : 'false'}
            placeholder={t(I18N_KEYS.client.profileBioPlaceholder)}
            {...register('description')}
          />
          <p className="typo-small">{t(I18N_KEYS.requestsPage.profileOnboardingDescriptionHint)}</p>
          {errors.description ? <p className="auth-form-error">{errors.description.message}</p> : null}
        </div>

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
      </form>
    </article>
  );
}
