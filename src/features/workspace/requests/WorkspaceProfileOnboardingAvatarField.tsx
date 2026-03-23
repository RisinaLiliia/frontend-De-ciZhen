'use client';

import Image from 'next/image';

import { FormLabel } from '@/components/ui/FormLabel';
import { IconCamera } from '@/components/ui/icons/icons';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';

type WorkspaceProfileOnboardingAvatarFieldProps = {
  t: (key: I18nKey) => string;
  loading: boolean;
  avatarPreviewUrl: string | null;
  avatarActionLabel: string;
  avatarInitial: string;
  avatarInputRef: React.RefObject<HTMLInputElement | null>;
  onAvatarSelected: (event: React.ChangeEvent<HTMLInputElement>) => void;
  openAvatarPicker: () => void;
  onAvatarClear: () => void;
};

export function WorkspaceProfileOnboardingAvatarField({
  t,
  loading,
  avatarPreviewUrl,
  avatarActionLabel,
  avatarInitial,
  avatarInputRef,
  onAvatarSelected,
  openAvatarPicker,
  onAvatarClear,
}: WorkspaceProfileOnboardingAvatarFieldProps) {
  return (
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
  );
}
