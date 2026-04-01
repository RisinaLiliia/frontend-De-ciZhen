'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import type { Option } from '@/components/ui/Select';
import { useCities, useServiceCategories, useServices } from '@/features/catalog/queries';
import { getRegisterErrorMessage, isEmailExistsError } from '@/features/auth/mapAuthError';
import { useAuthRegister, useAuthSetLastMode, useAuthStatus } from '@/hooks/useAuthSnapshot';
import { updateMyProviderProfile } from '@/lib/api/providers';
import { updateMe, uploadMyAvatar } from '@/lib/api/users';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useT } from '@/lib/i18n/useT';
import { WorkspaceProfileOnboardingAccountSection } from './WorkspaceProfileOnboardingAccountSection';
import { WorkspaceProfileOnboardingProfileSection } from './WorkspaceProfileOnboardingProfileSection';
import { useWorkspaceProfileOnboardingAvatar } from './useWorkspaceProfileOnboardingAvatar';
import {
  buildPasswordChecks,
  buildProfileCategoryOptions,
  buildProfileOnboardingSchema,
  resolveAvatarInitial,
  resolveProfileOnboardingSubmission,
  type ProfileOnboardingValues,
} from './workspaceProfileOnboarding.model';

export function WorkspaceProfileOnboardingForm() {
  const t = useT();
  const { locale } = useI18n();
  const router = useRouter();
  const status = useAuthStatus();
  const registerUser = useAuthRegister();
  const setLastMode = useAuthSetLastMode();

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
  const [selectedCityLabel, setSelectedCityLabel] = React.useState('');
  const {
    avatarFile,
    avatarPreviewUrl,
    avatarInputRef,
    onAvatarSelected,
    openAvatarPicker,
    onAvatarClear,
  } = useWorkspaceProfileOnboardingAvatar();

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
  const { data: selectedCities = [] } = useCities('DE', {
    enabled: Boolean(cityIdValue),
    ids: cityIdValue ? [cityIdValue] : [],
    limit: 1,
  });
  const passwordValue = watch('password') ?? '';
  const descriptionValue = watch('description');
  const descriptionLength = descriptionValue?.length ?? 0;
  const avatarInitial = resolveAvatarInitial(nameValue);
  const avatarActionLabel = avatarPreviewUrl
    ? t(I18N_KEYS.client.profilePhotoChangeAction)
    : t(I18N_KEYS.client.profilePhotoAddAction);
  const categoryOptions = React.useMemo<Option[]>(
    () => buildProfileCategoryOptions(categories, locale),
    [categories, locale],
  );
  const passwordChecks = React.useMemo(
    () => buildPasswordChecks(passwordValue),
    [passwordValue],
  );

  const onSubmit = React.useCallback(
    async (values: ProfileOnboardingValues) => {
      const submission = resolveProfileOnboardingSubmission(
        values,
        selectedCities,
        locale,
        services,
        selectedCityLabel,
      );
      if (!submission) {
        toast.error(t(I18N_KEYS.requestsPage.profileOnboardingCityRequired));
        return;
      }

      setIsSubmittingFlow(true);
      try {
        await registerUser({
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
          city: submission.cityLabel,
          role: 'provider',
          acceptPrivacyPolicy: values.acceptPrivacyPolicy,
        });

        await Promise.all([
          updateMe({
            name: values.name.trim(),
            city: submission.cityLabel,
            bio: submission.description || undefined,
          }),
          updateMyProviderProfile({
            displayName: values.name.trim(),
            bio: submission.description || undefined,
            cityId: values.cityId,
            ...(submission.selectedCategoryServiceKeys.length > 0
              ? { serviceKeys: submission.selectedCategoryServiceKeys }
              : {}),
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
    [avatarFile, locale, registerUser, router, selectedCities, selectedCityLabel, services, setError, setLastMode, t],
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
        <WorkspaceProfileOnboardingProfileSection
          t={t}
          locale={locale}
          loading={loading}
          requiredHint={requiredHint}
          categoryOptions={categoryOptions}
          isCitiesLoading={false}
          isCitiesError={false}
          isCategoriesLoading={isCategoriesLoading}
          isCategoriesError={isCategoriesError}
          cityIdValue={cityIdValue}
          categoryKeyValue={categoryKeyValue}
          nameValue={nameValue}
          descriptionLength={descriptionLength}
          avatarPreviewUrl={avatarPreviewUrl}
          avatarActionLabel={avatarActionLabel}
          avatarInitial={avatarInitial}
          avatarInputRef={avatarInputRef}
          onAvatarSelected={onAvatarSelected}
          openAvatarPicker={openAvatarPicker}
          onAvatarClear={onAvatarClear}
          register={register}
          setValue={setValue}
          onCityOptionSelect={(option) => setSelectedCityLabel(option.label)}
          errors={errors}
        />

        <WorkspaceProfileOnboardingAccountSection
          t={t}
          loading={loading}
          requiredHint={requiredHint}
          showPassword={showPassword}
          passwordToggleLabel={passwordToggleLabel}
          passwordChecks={passwordChecks}
          consentPrivacyHref={consentPrivacyHref}
          consentCookieHref={consentCookieHref}
          register={register}
          errors={errors}
          onToggleShowPassword={() => setShowPassword((prev) => !prev)}
        />
      </form>
    </article>
  );
}
