import { OfferActionButton } from '@/components/ui/OfferActionButton';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';

type Translate = (key: I18nKey) => string;

type ProfileBioSectionProps = {
  t: Translate;
  bioDraft: string;
  isBioEditing: boolean;
  isSavingBio: boolean;
  onBioChange: (value: string) => void;
  onStartBioEdit: () => void;
  onCancelBioEdit: () => void;
  onSaveBio: () => void;
};

export function ProfileBioSection({
  t,
  bioDraft,
  isBioEditing,
  isSavingBio,
  onBioChange,
  onStartBioEdit,
  onCancelBioEdit,
  onSaveBio,
}: ProfileBioSectionProps) {
  const profileDescription = bioDraft.trim();

  return (
    <article className="profile-bio">
      <header className="profile-bio__head">
        <div className="profile-bio__title-wrap">
          <p className="profile-bio__label">{t(I18N_KEYS.client.profileBioLabel)}</p>
        </div>
        <span className="count-badge count-badge--sm">{profileDescription.length}/2000</span>
      </header>

      <textarea
        className={`input profile-bio__textarea ${isBioEditing ? '' : 'profile-bio__textarea--readonly'}`.trim()}
        value={bioDraft}
        onChange={(event) => onBioChange(event.target.value)}
        maxLength={2000}
        placeholder={t(I18N_KEYS.client.profileBioPlaceholder)}
        readOnly={!isBioEditing}
      />

      <div className="profile-bio__footer">
        <p className="profile-bio__hint">
          {profileDescription
            ? t(I18N_KEYS.client.profileBioHintFilled)
            : t(I18N_KEYS.client.profileBioHintEmpty)}
        </p>
        {isBioEditing ? (
          <div className="profile-bio__actions">
            <button
              type="button"
              className="btn-ghost profile-bio__action"
              onClick={onCancelBioEdit}
              disabled={isSavingBio}
            >
              {t(I18N_KEYS.client.profileCancelCta)}
            </button>
            <button
              type="button"
              className="btn-primary profile-bio__action"
              onClick={onSaveBio}
              disabled={isSavingBio}
            >
              {isSavingBio ? t(I18N_KEYS.common.refreshing) : t(I18N_KEYS.client.profileSaveCta)}
            </button>
          </div>
        ) : (
          <OfferActionButton
            kind="edit"
            label={t(I18N_KEYS.client.profileBioEditAction)}
            ariaLabel={t(I18N_KEYS.client.profileBioEditAction)}
            title={t(I18N_KEYS.client.profileBioEditAction)}
            iconOnly
            className="request-card__status-action request-card__status-action--edit profile-bio__save-icon"
            onClick={onStartBioEdit}
          />
        )}
      </div>
    </article>
  );
}
