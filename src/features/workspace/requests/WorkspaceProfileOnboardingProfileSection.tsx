'use client';

import { CitySearchSelect } from '@/components/ui/CitySearchSelect';
import { Field } from '@/components/ui/Field';
import { FormLabel } from '@/components/ui/FormLabel';
import { Input } from '@/components/ui/Input';
import { Select, type Option } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';

import { I18N_KEYS } from '@/lib/i18n/keys';
import { WorkspaceProfileOnboardingAvatarField } from './WorkspaceProfileOnboardingAvatarField';
import type { ProfileOnboardingValues } from './workspaceProfileOnboarding.model';

type WorkspaceProfileOnboardingProfileSectionProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  loading: boolean;
  requiredHint: string;
  categoryOptions: Option[];
  isCitiesLoading: boolean;
  isCitiesError: boolean;
  isCategoriesLoading: boolean;
  isCategoriesError: boolean;
  cityIdValue: string;
  categoryKeyValue: string;
  nameValue: string;
  descriptionLength: number;
  avatarPreviewUrl: string | null;
  avatarActionLabel: string;
  avatarInitial: string;
  avatarInputRef: React.RefObject<HTMLInputElement | null>;
  onAvatarSelected: (event: React.ChangeEvent<HTMLInputElement>) => void;
  openAvatarPicker: () => void;
  onAvatarClear: () => void;
  onCityOptionSelect: (option: { value: string; label: string }) => void;
  register: UseFormRegister<ProfileOnboardingValues>;
  setValue: UseFormSetValue<ProfileOnboardingValues>;
  errors: FieldErrors<ProfileOnboardingValues>;
};

export function WorkspaceProfileOnboardingProfileSection({
  t,
  locale,
  loading,
  requiredHint,
  categoryOptions,
  isCitiesLoading,
  isCitiesError,
  isCategoriesLoading,
  isCategoriesError,
  cityIdValue,
  categoryKeyValue,
  descriptionLength,
  avatarPreviewUrl,
  avatarActionLabel,
  avatarInitial,
  avatarInputRef,
  onAvatarSelected,
  openAvatarPicker,
  onAvatarClear,
  onCityOptionSelect,
  register,
  setValue,
  errors,
}: WorkspaceProfileOnboardingProfileSectionProps) {
  return (
    <section className="stack-sm">
      <WorkspaceProfileOnboardingAvatarField
        t={t}
        loading={loading}
        avatarPreviewUrl={avatarPreviewUrl}
        avatarActionLabel={avatarActionLabel}
        avatarInitial={avatarInitial}
        avatarInputRef={avatarInputRef}
        onAvatarSelected={onAvatarSelected}
        openAvatarPicker={openAvatarPicker}
        onAvatarClear={onAvatarClear}
      />
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
            <CitySearchSelect
              locale={locale}
              value={cityIdValue || ''}
              onChange={(value) => {
                setValue('cityId', value, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              placeholder={isCitiesLoading ? t(I18N_KEYS.common.refreshing) : t(I18N_KEYS.home.cityPlaceholder)}
              disabled={isCitiesLoading || isCitiesError || loading}
              ariaLabel={t(I18N_KEYS.requestsPage.cityLabel)}
              searchPlaceholder={t(I18N_KEYS.home.cityPlaceholder)}
              loadingLabel={t(I18N_KEYS.common.refreshing)}
              emptyLabel={t(I18N_KEYS.common.noResults)}
              errorLabel={t(I18N_KEYS.common.loadErrorShort)}
              onSelectOption={onCityOptionSelect}
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
    </section>
  );
}
