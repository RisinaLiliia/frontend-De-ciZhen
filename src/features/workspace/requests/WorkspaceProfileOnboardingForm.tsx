'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { CitySearchSelect } from '@/components/ui/CitySearchSelect';
import { Select } from '@/components/ui/Select';
import type { Option } from '@/components/ui/Select';
import { Field } from '@/components/ui/Field';
import { FormLabel } from '@/components/ui/FormLabel';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useServiceCategories, useServices } from '@/features/catalog/queries';
import { useAuthStore } from '@/features/auth/store';
import { getRegisterErrorMessage, isEmailExistsError } from '@/features/auth/mapAuthError';
import {
  useAuthSetLastMode,
  useAuthStatus,
} from '@/hooks/useAuthSnapshot';
import { setAccessToken } from '@/lib/auth/token';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useT } from '@/lib/i18n/useT';
import { getWorkspaceProfile, registerWorkspaceProfile, saveWorkspaceProfile } from '@/lib/api/workspace';
import { WorkspaceBadge } from '@/features/workspace/shared/WorkspaceBadge';
import { workspaceCardShell } from '@/features/workspace/shared/workspaceSurfaceShell';
import { WorkspaceProfileOnboardingAccountSection } from './WorkspaceProfileOnboardingAccountSection';
import { WorkspaceProfileOnboardingAvatarField } from './WorkspaceProfileOnboardingAvatarField';
import { WorkspaceProfileOnboardingProfileSection } from './WorkspaceProfileOnboardingProfileSection';
import { useWorkspaceProfileOnboardingAvatar } from './useWorkspaceProfileOnboardingAvatar';
import {
  buildPasswordChecks,
  buildProfileCategoryOptions,
  buildProfileServiceOptions,
  buildProfileOnboardingSchema,
  buildWorkspaceProfileRegisterFormData,
  buildWorkspaceProfileSaveFormData,
  resolveAvatarInitial,
  resolveProfileServiceCategoryKey,
  type ProfileOnboardingValues,
} from './workspaceProfileOnboarding.model';

type CommonProfileFormState = {
  name: string;
  city: string;
  cityId: string;
  phone: string;
};

type ProviderProfileFormState = {
  displayName: string;
  bio: string;
  basePrice: string;
  categoryKey: string;
  serviceKey: string;
};

const workspaceProfileQK = {
  current: () => ['workspace-profile'] as const,
};

function WorkspaceProfileOnboardingRoleSection({
  viewerMode,
  t,
  loading,
  isCategoriesLoading,
  isCategoriesError,
  categoryOptions,
  serviceOptions,
  categoryKey,
  serviceKey,
  description,
  basePrice,
  displayName,
  onCategoryChange,
  onServiceChange,
  onDescriptionChange,
  onBasePriceChange,
  onDisplayNameChange,
}: {
  viewerMode: 'provider' | 'customer';
  t: ReturnType<typeof useT>;
  loading: boolean;
  isCategoriesLoading: boolean;
  isCategoriesError: boolean;
  categoryOptions: Option[];
  serviceOptions: Option[];
  categoryKey: string;
  serviceKey: string;
  description: string;
  basePrice?: string;
  displayName?: string;
  onCategoryChange?: (value: string) => void;
  onServiceChange?: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onBasePriceChange?: (value: string) => void;
  onDisplayNameChange?: (value: string) => void;
}) {
  return viewerMode === 'provider' ? (
    <section className="stack-sm workspace-profile-onboarding__section">
      <div className="workspace-profile-onboarding__grid">
        <div className="form-group">
          <FormLabel htmlFor="workspace-profile-display-name">
            {t(I18N_KEYS.provider.displayName)}
          </FormLabel>
          <Field>
            <Input
              id="workspace-profile-display-name"
              value={displayName ?? ''}
              onChange={(event) => onDisplayNameChange?.(event.target.value)}
              disabled={loading}
            />
          </Field>
        </div>

        <div className="form-group">
          <FormLabel htmlFor="workspace-profile-base-price">
            {t(I18N_KEYS.provider.basePrice)}
          </FormLabel>
          <Field>
            <Input
              id="workspace-profile-base-price"
              type="number"
              min={0}
              value={basePrice ?? ''}
              onChange={(event) => onBasePriceChange?.(event.target.value)}
              disabled={loading}
            />
          </Field>
        </div>

        <div className="form-group">
          <FormLabel htmlFor="workspace-profile-category">
            {t(I18N_KEYS.request.categoryLabel)}
          </FormLabel>
          <Field>
            <Select
              id="workspace-profile-category"
              options={categoryOptions}
              value={categoryKey || undefined}
              onChange={(value) => onCategoryChange?.(value)}
              placeholder={isCategoriesLoading ? t(I18N_KEYS.common.refreshing) : t(I18N_KEYS.request.categoryPlaceholder)}
              disabled={loading || isCategoriesLoading || isCategoriesError}
              aria-label={t(I18N_KEYS.request.categoryLabel)}
            />
          </Field>
        </div>

        <div className="form-group">
          <FormLabel htmlFor="workspace-profile-service">
            {t(I18N_KEYS.request.subcategoryLabel)}
          </FormLabel>
          <Field>
            <Select
              id="workspace-profile-service"
              options={serviceOptions}
              value={serviceKey || undefined}
              onChange={(value) => onServiceChange?.(value)}
              placeholder={t(I18N_KEYS.request.subcategoryPlaceholder)}
              disabled={loading || !categoryKey}
              aria-label={t(I18N_KEYS.request.subcategoryLabel)}
            />
          </Field>
        </div>
      </div>

      <div className="form-group">
        <div className="request-form__meta">
          <FormLabel htmlFor="workspace-profile-description">
            {t(I18N_KEYS.provider.bio)}
          </FormLabel>
          <span className="form-counter">{description.length}/500</span>
        </div>
        <Textarea
          id="workspace-profile-description"
          value={description}
          maxLength={500}
          placeholder={t(I18N_KEYS.client.profileBioPlaceholder)}
          onChange={(event) => onDescriptionChange(event.target.value)}
          disabled={loading}
        />
        <p className="typo-small">{t(I18N_KEYS.requestsPage.profileOnboardingDescriptionHint)}</p>
      </div>
    </section>
  ) : (
    <section className="stack-sm workspace-profile-onboarding__section">
      <div className="form-group">
        <div className="request-form__meta">
          <FormLabel htmlFor="workspace-profile-description">
            {t(I18N_KEYS.client.profileBioLabel)}
          </FormLabel>
          <span className="form-counter">{description.length}/500</span>
        </div>
        <Textarea
          id="workspace-profile-description"
          value={description}
          maxLength={500}
          placeholder={t(I18N_KEYS.client.profileBioPlaceholder)}
          onChange={(event) => onDescriptionChange(event.target.value)}
          disabled={loading}
        />
        <p className="typo-small">{t(I18N_KEYS.requestsPage.profileOnboardingDescriptionHint)}</p>
      </div>
    </section>
  );
}

type AuthenticatedWorkspaceProfileFormProps = {
  viewerMode: 'provider' | 'customer';
  t: ReturnType<typeof useT>;
  locale: ReturnType<typeof useI18n>['locale'];
  loading: boolean;
  requiredHint: string;
  categories: Awaited<ReturnType<typeof useServiceCategories>>['data'];
  isCategoriesLoading: boolean;
  isCategoriesError: boolean;
  services: Awaited<ReturnType<typeof useServices>>['data'];
  avatarFile: File | null;
  avatarPreviewUrl: string | null;
  avatarInputRef: React.RefObject<HTMLInputElement | null>;
  onAvatarSelected: (event: React.ChangeEvent<HTMLInputElement>) => void;
  openAvatarPicker: () => void;
  onAvatarClear: () => void;
  resetAvatarSelection: () => void;
};

function AuthenticatedWorkspaceProfileForm({
  viewerMode,
  t,
  locale,
  loading,
  requiredHint,
  categories,
  isCategoriesLoading,
  isCategoriesError,
  services,
  avatarFile,
  avatarPreviewUrl,
  avatarInputRef,
  onAvatarSelected,
  openAvatarPicker,
  onAvatarClear,
  resetAvatarSelection,
}: AuthenticatedWorkspaceProfileFormProps) {
  const qc = useQueryClient();
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const setLastMode = useAuthSetLastMode();
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: workspaceProfileQK.current(),
    queryFn: getWorkspaceProfile,
  });

  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [commonForm, setCommonForm] = React.useState<CommonProfileFormState>({
    name: '',
    city: '',
    cityId: '',
    phone: '',
  });
  const [customerBioDraft, setCustomerBioDraft] = React.useState('');
  const [providerForm, setProviderForm] = React.useState<ProviderProfileFormState>({
    displayName: '',
    bio: '',
    basePrice: '',
    categoryKey: '',
    serviceKey: '',
  });

  React.useEffect(() => {
    setCommonForm({
      name: profile?.common.name ?? '',
      city: profile?.common.city ?? '',
      cityId: profile?.common.cityId ?? '',
      phone: profile?.common.phone ?? '',
    });
    setCustomerBioDraft(profile?.customer.bio ?? '');
  }, [profile?.common.city, profile?.common.cityId, profile?.common.name, profile?.common.phone, profile?.customer.bio]);

  React.useEffect(() => {
    setProviderForm({
      displayName: profile?.provider.displayName ?? profile?.common.name ?? '',
      bio: profile?.provider.bio ?? '',
      basePrice:
        typeof profile?.provider.basePrice === 'number' && Number.isFinite(profile.provider.basePrice)
          ? String(profile.provider.basePrice)
          : '',
      categoryKey:
        profile?.provider.selectedCategoryKey
        ?? resolveProfileServiceCategoryKey(profile?.provider.selectedServiceKey, services ?? []),
      serviceKey: profile?.provider.selectedServiceKey ?? '',
    });
  }, [
    profile?.common.name,
    profile?.provider.basePrice,
    profile?.provider.bio,
    profile?.provider.cityId,
    profile?.provider.displayName,
    profile?.provider.selectedCategoryKey,
    profile?.provider.selectedServiceKey,
    services,
  ]);

  const effectiveAvatarUrl = avatarPreviewUrl ?? profile?.common.avatarUrl ?? null;
  const avatarActionLabel = effectiveAvatarUrl
    ? t(I18N_KEYS.client.profilePhotoChangeAction)
    : t(I18N_KEYS.client.profilePhotoAddAction);
  const avatarInitial = resolveAvatarInitial(commonForm.name || profile?.common.name);
  const categoryOptions = React.useMemo<Option[]>(
    () => buildProfileCategoryOptions(categories ?? [], locale),
    [categories, locale],
  );
  const serviceOptions = React.useMemo(
    () => buildProfileServiceOptions(services ?? [], providerForm.categoryKey, locale),
    [locale, providerForm.categoryKey, services],
  );
  const commonIsDirty = React.useMemo(
    () =>
      commonForm.name !== (profile?.common.name ?? '') ||
      commonForm.city !== (profile?.common.city ?? '') ||
      commonForm.cityId !== (profile?.common.cityId ?? '') ||
      commonForm.phone !== (profile?.common.phone ?? '') ||
      avatarFile !== null,
    [
      avatarFile,
      commonForm.city,
      commonForm.cityId,
      commonForm.name,
      commonForm.phone,
      profile?.common.city,
      profile?.common.cityId,
      profile?.common.name,
      profile?.common.phone,
    ],
  );
  const providerIsDirty = React.useMemo(() => {
    return (
      providerForm.displayName !== (profile?.provider.displayName ?? profile?.common.name ?? '') ||
      providerForm.bio !== (profile?.provider.bio ?? '') ||
      providerForm.basePrice !==
        (typeof profile?.provider.basePrice === 'number' && Number.isFinite(profile.provider.basePrice)
          ? String(profile.provider.basePrice)
          : '') ||
      providerForm.categoryKey !== (profile?.provider.selectedCategoryKey ?? '') ||
      providerForm.serviceKey !== (profile?.provider.selectedServiceKey ?? '')
    );
  }, [
    providerForm.basePrice,
    providerForm.bio,
    providerForm.categoryKey,
    providerForm.displayName,
    providerForm.serviceKey,
    profile?.common.name,
    profile?.provider.basePrice,
    profile?.provider.bio,
    profile?.provider.displayName,
    profile?.provider.selectedCategoryKey,
    profile?.provider.selectedServiceKey,
  ]);
  const customerIsDirty = React.useMemo(
    () => customerBioDraft !== (profile?.customer.bio ?? ''),
    [customerBioDraft, profile?.customer.bio],
  );

  const handleSaveAuthenticatedProfile = React.useCallback(async () => {
    const name = commonForm.name.trim();
    if (name.length < 2) {
      toast.error(t(I18N_KEYS.client.profileNameMinError));
      return;
    }

    const normalizedBasePrice = providerForm.basePrice.trim();
    const parsedBasePrice =
      normalizedBasePrice.length > 0
        ? Number(normalizedBasePrice.replace(',', '.'))
        : undefined;

    if (normalizedBasePrice.length > 0 && (!Number.isFinite(parsedBasePrice) || Number(parsedBasePrice) < 0)) {
      toast.error(t(I18N_KEYS.client.requestPriceInvalidError));
      return;
    }

    if (!(commonIsDirty || (viewerMode === 'provider' ? providerIsDirty : customerIsDirty))) {
      return;
    }

    setIsSavingProfile(true);
    try {
      const saved = await saveWorkspaceProfile(buildWorkspaceProfileSaveFormData({
        name,
        city: commonForm.city,
        phone: commonForm.phone,
        customerBio: viewerMode === 'customer' ? customerBioDraft : undefined,
        providerDisplayName: viewerMode === 'provider' ? providerForm.displayName : undefined,
        providerBio: viewerMode === 'provider' ? providerForm.bio : undefined,
        providerCategoryKey: viewerMode === 'provider' ? providerForm.categoryKey : undefined,
        providerServiceKey: viewerMode === 'provider' ? providerForm.serviceKey : undefined,
        providerBasePrice: viewerMode === 'provider' ? providerForm.basePrice : undefined,
        avatarFile,
      }));
      qc.setQueryData(workspaceProfileQK.current(), saved);
      await fetchMe();
      setLastMode(viewerMode === 'provider' ? 'provider' : 'client');
      if (avatarFile) {
        resetAvatarSelection();
      }
      toast.success(
        viewerMode === 'provider'
          ? t(I18N_KEYS.provider.profileSaved)
          : t(I18N_KEYS.client.profileUpdated),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    } finally {
      setIsSavingProfile(false);
    }
  }, [
    avatarFile,
    commonForm.city,
    commonForm.name,
    commonForm.phone,
    commonIsDirty,
    customerBioDraft,
    customerIsDirty,
    fetchMe,
    providerForm.basePrice,
    providerForm.bio,
    providerForm.categoryKey,
    providerForm.displayName,
    providerForm.serviceKey,
    providerIsDirty,
    qc,
    resetAvatarSelection,
    setLastMode,
    t,
    viewerMode,
  ]);

  const isBusy = loading || isProfileLoading || isSavingProfile;

  return (
    <div className="stack-md">
      <article className={workspaceCardShell('stack-md', 'workspace-profile-onboarding')} aria-labelledby="workspace-profile-auth-title">
        <header className="stack-sm">
          <WorkspaceBadge variant="info" className="workspace-profile-onboarding__step">
            {t(I18N_KEYS.requestsPage.profileOnboardingStep)}
          </WorkspaceBadge>
          <h2 id="workspace-profile-auth-title" className="typo-h3">
            {t(I18N_KEYS.provider.onboardingTitle)}
          </h2>
          <p className="typo-small">{t(I18N_KEYS.requestsPage.profileOnboardingSubtitle)}</p>
        </header>

        <div className="workspace-profile-onboarding__form">
          <WorkspaceProfileOnboardingAvatarField
            t={t}
            loading={isBusy}
            avatarPreviewUrl={effectiveAvatarUrl}
            avatarActionLabel={avatarActionLabel}
            avatarInitial={avatarInitial}
            showClearAction={avatarFile != null}
            avatarInputRef={avatarInputRef}
            onAvatarSelected={onAvatarSelected}
            openAvatarPicker={openAvatarPicker}
            onAvatarClear={onAvatarClear}
          />

          <div className="request-form__row is-2">
            <div className="form-group">
              <FormLabel htmlFor="workspace-profile-auth-name" required requiredHint={requiredHint}>
                {t(I18N_KEYS.auth.nameLabel)}
              </FormLabel>
              <Field>
                <Input
                  id="workspace-profile-auth-name"
                  value={commonForm.name}
                  onChange={(event) => setCommonForm((prev) => ({ ...prev, name: event.target.value }))}
                  disabled={isBusy}
                />
              </Field>
            </div>

            <div className="form-group">
              <FormLabel htmlFor="workspace-profile-auth-city" required requiredHint={requiredHint}>
                {t(I18N_KEYS.provider.city)}
              </FormLabel>
              <Field>
                <CitySearchSelect
                  locale={locale}
                  value={commonForm.cityId || ''}
                  onChange={(value) => {
                    setCommonForm((prev) => ({ ...prev, cityId: value }));
                  }}
                  placeholder={t(I18N_KEYS.home.cityPlaceholder)}
                  disabled={isBusy}
                  ariaLabel={t(I18N_KEYS.requestsPage.cityLabel)}
                  searchPlaceholder={t(I18N_KEYS.home.cityPlaceholder)}
                  loadingLabel={t(I18N_KEYS.common.refreshing)}
                  emptyLabel={t(I18N_KEYS.common.noResults)}
                  errorLabel={t(I18N_KEYS.common.loadErrorShort)}
                  onSelectOption={(option) => {
                    setCommonForm((prev) => ({
                      ...prev,
                      cityId: option.value,
                      city: option.label,
                    }));
                  }}
                />
              </Field>
            </div>
          </div>

          <WorkspaceProfileOnboardingRoleSection
            viewerMode={viewerMode}
            t={t}
            loading={isBusy}
            isCategoriesLoading={isCategoriesLoading}
            isCategoriesError={isCategoriesError}
            categoryOptions={categoryOptions}
            serviceOptions={serviceOptions}
            categoryKey={providerForm.categoryKey}
            serviceKey={providerForm.serviceKey}
            description={viewerMode === 'provider' ? providerForm.bio : customerBioDraft}
            basePrice={providerForm.basePrice}
            displayName={providerForm.displayName}
            onCategoryChange={(value) => {
              setProviderForm((prev) => ({
                ...prev,
                categoryKey: value,
                serviceKey:
                  services?.some(
                    (service) => service.key === prev.serviceKey && service.categoryKey === value,
                  )
                    ? prev.serviceKey
                    : '',
              }));
            }}
            onServiceChange={(value) => {
              setProviderForm((prev) => ({ ...prev, serviceKey: value }));
            }}
            onDescriptionChange={(value) => {
              if (viewerMode === 'provider') {
                setProviderForm((prev) => ({ ...prev, bio: value }));
                return;
              }
              setCustomerBioDraft(value);
            }}
            onBasePriceChange={(value) => {
              setProviderForm((prev) => ({ ...prev, basePrice: value }));
            }}
            onDisplayNameChange={(value) => {
              setProviderForm((prev) => ({ ...prev, displayName: value }));
            }}
          />

          <section className="stack-sm">
            <div className="request-form__row is-2">
              <div className="form-group">
                <FormLabel htmlFor="workspace-profile-auth-email">
                  {t(I18N_KEYS.auth.emailLabel)}
                </FormLabel>
                <Field>
                  <Input
                    id="workspace-profile-auth-email"
                    type="email"
                    value={profile?.common.email ?? ''}
                    disabled
                    readOnly
                  />
                </Field>
              </div>

              <div className="form-group">
                <FormLabel htmlFor="workspace-profile-auth-phone">
                  {t(I18N_KEYS.requestsPage.profileOnboardingPhoneLabel)}
                </FormLabel>
                <Field>
                  <Input
                    id="workspace-profile-auth-phone"
                    type="tel"
                    autoComplete="tel"
                    value={commonForm.phone}
                    onChange={(event) => setCommonForm((prev) => ({ ...prev, phone: event.target.value }))}
                    disabled={isBusy}
                  />
                </Field>
              </div>
            </div>

            <div className="workspace-profile-onboarding__actions">
              <button
                type="button"
                className="auth-social__btn auth-social__btn--google"
                onClick={() => {
                  void handleSaveAuthenticatedProfile();
                }}
                disabled={
                  isBusy
                  || !(commonIsDirty || (viewerMode === 'provider' ? providerIsDirty : customerIsDirty))
                }
              >
                {isBusy
                  ? t(I18N_KEYS.common.refreshing)
                  : t(I18N_KEYS.provider.onboardingCta)}
              </button>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}

type AnonymousWorkspaceProfileFormProps = {
  viewerMode: 'provider' | 'customer';
  t: ReturnType<typeof useT>;
  locale: ReturnType<typeof useI18n>['locale'];
  loading: boolean;
  services: Awaited<ReturnType<typeof useServices>>['data'];
  categories: Awaited<ReturnType<typeof useServiceCategories>>['data'];
  isCategoriesLoading: boolean;
  isCategoriesError: boolean;
  avatarFile: File | null;
  avatarPreviewUrl: string | null;
  avatarInputRef: React.RefObject<HTMLInputElement | null>;
  onAvatarSelected: (event: React.ChangeEvent<HTMLInputElement>) => void;
  openAvatarPicker: () => void;
  onAvatarClear: () => void;
};

function AnonymousWorkspaceProfileForm({
  viewerMode,
  t,
  locale,
  loading,
  services,
  categories,
  isCategoriesLoading,
  isCategoriesError,
  avatarFile,
  avatarPreviewUrl,
  avatarInputRef,
  onAvatarSelected,
  openAvatarPicker,
  onAvatarClear,
}: AnonymousWorkspaceProfileFormProps) {
  const router = useRouter();
  const status = useAuthStatus();
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const setLastMode = useAuthSetLastMode();
  const schema = React.useMemo(() => buildProfileOnboardingSchema(t), [t]);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmittingFlow, setIsSubmittingFlow] = React.useState(false);

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
      serviceKey: '',
      description: '',
      email: '',
      password: '',
      acceptPrivacyPolicy: false,
    },
  });

  const consentPrivacyHref = process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL?.trim() || '/privacy-policy';
  const consentCookieHref = process.env.NEXT_PUBLIC_COOKIE_NOTICE_URL?.trim() || '/cookie-notice';
  const requiredHint = t(I18N_KEYS.common.requiredFieldHint);
  const passwordToggleLabel = showPassword
    ? t(I18N_KEYS.client.profilePasswordHide)
    : t(I18N_KEYS.client.profilePasswordShow);
  const nameValue = watch('name');
  const cityIdValue = watch('cityId');
  const categoryKeyValue = watch('categoryKey');
  const serviceKeyValue = watch('serviceKey');
  const passwordValue = watch('password') ?? '';
  const descriptionValue = watch('description');
  const avatarInitial = resolveAvatarInitial(nameValue);
  const avatarActionLabel = avatarPreviewUrl
    ? t(I18N_KEYS.client.profilePhotoChangeAction)
    : t(I18N_KEYS.client.profilePhotoAddAction);
  const categoryOptions = React.useMemo<Option[]>(
    () => buildProfileCategoryOptions(categories ?? [], locale),
    [categories, locale],
  );
  const serviceOptions = React.useMemo<Option[]>(
    () => buildProfileServiceOptions(services ?? [], categoryKeyValue, locale),
    [categoryKeyValue, locale, services],
  );
  const passwordChecks = React.useMemo(
    () => buildPasswordChecks(passwordValue),
    [passwordValue],
  );

  const onSubmit = React.useCallback(
    async (values: ProfileOnboardingValues) => {
      setIsSubmittingFlow(true);
      try {
        const auth = await registerWorkspaceProfile(buildWorkspaceProfileRegisterFormData({
          viewerMode,
          name: values.name,
          email: values.email,
          password: values.password,
          cityId: values.cityId,
          acceptPrivacyPolicy: values.acceptPrivacyPolicy,
          customerBio: viewerMode === 'customer' ? values.description : undefined,
          providerDisplayName: viewerMode === 'provider' ? values.name : undefined,
          providerBio: viewerMode === 'provider' ? values.description : undefined,
          providerCategoryKey: viewerMode === 'provider' ? values.categoryKey : undefined,
          providerServiceKey: viewerMode === 'provider' ? values.serviceKey : undefined,
          avatarFile,
        }));
        setAccessToken(auth.accessToken);
        await fetchMe();
        setLastMode(viewerMode === 'provider' ? 'provider' : 'client');
        toast.success(t(I18N_KEYS.requestsPage.profileOnboardingSuccess));
        router.replace('/workspace?section=requests&scope=my&period=90d&range=90d');
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
    [avatarFile, fetchMe, router, setError, setLastMode, t, viewerMode],
  );

  return (
    <article className={workspaceCardShell('stack-md', 'workspace-profile-onboarding')} aria-labelledby="workspace-profile-onboarding-title">
      <header className="stack-sm">
        <WorkspaceBadge variant="info" className="workspace-profile-onboarding__step">
          {t(I18N_KEYS.requestsPage.profileOnboardingStep)}
        </WorkspaceBadge>
        <h2 id="workspace-profile-onboarding-title" className="typo-h3">
          {t(I18N_KEYS.provider.onboardingTitle)}
        </h2>
        <p className="typo-small">{t(I18N_KEYS.requestsPage.profileOnboardingSubtitle)}</p>
      </header>

      <form className="workspace-profile-onboarding__form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <WorkspaceProfileOnboardingProfileSection
          t={t}
          locale={locale}
          loading={loading || isSubmittingFlow || isSubmitting || status === 'loading'}
          requiredHint={requiredHint}
          isCitiesLoading={false}
          isCitiesError={false}
          cityIdValue={cityIdValue}
          avatarPreviewUrl={avatarPreviewUrl}
          avatarActionLabel={avatarActionLabel}
          avatarInitial={avatarInitial}
          avatarInputRef={avatarInputRef}
          onAvatarSelected={onAvatarSelected}
          openAvatarPicker={openAvatarPicker}
          onAvatarClear={onAvatarClear}
          register={register}
          setValue={setValue}
          onCityOptionSelect={() => undefined}
          errors={errors}
        />

        <WorkspaceProfileOnboardingRoleSection
          viewerMode={viewerMode}
          t={t}
          loading={loading || isSubmittingFlow || isSubmitting}
          isCategoriesLoading={isCategoriesLoading}
          isCategoriesError={isCategoriesError}
          categoryOptions={categoryOptions}
          serviceOptions={serviceOptions}
          categoryKey={categoryKeyValue}
          serviceKey={serviceKeyValue}
          description={descriptionValue ?? ''}
          displayName={nameValue}
          onCategoryChange={(value) => {
            setValue('categoryKey', value, {
              shouldDirty: true,
              shouldValidate: true,
            });
            setValue(
              'serviceKey',
              services?.some(
                (service) => service.key === serviceKeyValue && service.categoryKey === value,
              )
                ? serviceKeyValue
                : '',
              { shouldDirty: true, shouldValidate: true },
            );
          }}
          onServiceChange={(value) => {
            setValue('serviceKey', value, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
          onDescriptionChange={(value) => {
            setValue('description', value, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
        />
        {errors.description ? <p className="auth-form-error">{errors.description.message}</p> : null}

        <WorkspaceProfileOnboardingAccountSection
          t={t}
          loading={loading || isSubmittingFlow || isSubmitting || status === 'loading'}
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

export function WorkspaceProfileOnboardingForm({
  viewerMode,
}: {
  viewerMode: 'provider' | 'customer';
}) {
  const t = useT();
  const { locale } = useI18n();
  const status = useAuthStatus();
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useServiceCategories();
  const {
    data: services = [],
    isLoading: isServicesLoading,
  } = useServices();
  const {
    avatarFile,
    avatarPreviewUrl,
    avatarInputRef,
    onAvatarSelected,
    openAvatarPicker,
    onAvatarClear,
    resetAvatarSelection,
  } = useWorkspaceProfileOnboardingAvatar();

  if (status === 'authenticated') {
    return (
      <AuthenticatedWorkspaceProfileForm
        viewerMode={viewerMode}
        t={t}
        locale={locale}
        loading={isServicesLoading}
        requiredHint={t(I18N_KEYS.common.requiredFieldHint)}
        categories={categories}
        isCategoriesLoading={isCategoriesLoading}
        isCategoriesError={isCategoriesError}
        services={services}
        avatarFile={avatarFile}
        avatarPreviewUrl={avatarPreviewUrl}
        avatarInputRef={avatarInputRef}
        onAvatarSelected={onAvatarSelected}
        openAvatarPicker={openAvatarPicker}
        onAvatarClear={onAvatarClear}
        resetAvatarSelection={resetAvatarSelection}
      />
    );
  }

  return (
    <AnonymousWorkspaceProfileForm
      viewerMode={viewerMode}
      t={t}
      locale={locale}
      loading={isServicesLoading}
      services={services}
      categories={categories}
      isCategoriesLoading={isCategoriesLoading}
      isCategoriesError={isCategoriesError}
      avatarFile={avatarFile}
      avatarPreviewUrl={avatarPreviewUrl}
      avatarInputRef={avatarInputRef}
      onAvatarSelected={onAvatarSelected}
      openAvatarPicker={openAvatarPicker}
      onAvatarClear={onAvatarClear}
    />
  );
}
