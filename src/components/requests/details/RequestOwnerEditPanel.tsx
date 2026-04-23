import * as React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { CitySearchSelect } from '@/components/ui/CitySearchSelect';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { IconEdit, IconTrash } from '@/components/ui/icons/icons';
import type { Locale } from '@/lib/i18n/t';
import { normalizeAppImageSrc, shouldBypassNextImageOptimization } from '@/lib/requests/images';

type RequestOwnerEditPanelProps = {
  isEditMode: boolean;
  showPublishAction: boolean;
  isSaving: boolean;
  isUploadingPhoto: boolean;
  activeSubmitIntent: 'draft' | 'publish' | null;
  titleValue: string;
  descriptionValue: string;
  priceValue: string;
  cityValue: string;
  preferredDateValue: string;
  priceTrend: 'up' | 'down' | null;
  photos: string[];
  locale: Locale;
  ownerEditLabel: string;
  ownerClearLabel: string;
  cityPlaceholder: string;
  cityLabel: string;
  preferredDateLabel: string;
  titlePlaceholder: string;
  titleLabel: string;
  descriptionPlaceholder: string;
  descriptionLabel: string;
  pricePlaceholder: string;
  priceLabel: string;
  removePhotoLabel: string;
  addPhotoLabel: string;
  photosHintLabel: string;
  cancelLabel: string;
  saveLabel: string;
  publishLabel: string;
  priceTrendDownLabel: string;
  priceTrendUpLabel: string;
  onToggleEdit: () => void;
  onClearText: () => void;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onPreferredDateChange: (value: string) => void;
  onPhotoPick: (files: FileList | null) => void;
  onRemovePhoto: (index: number) => void;
  onCancelEdit: () => void;
  onSave: (intent?: 'draft' | 'publish') => void;
};

export function RequestOwnerEditPanel({
  isEditMode,
  showPublishAction,
  isSaving,
  isUploadingPhoto,
  activeSubmitIntent,
  titleValue,
  descriptionValue,
  priceValue,
  cityValue,
  preferredDateValue,
  priceTrend,
  photos,
  locale,
  ownerEditLabel,
  ownerClearLabel,
  cityPlaceholder,
  cityLabel,
  preferredDateLabel,
  titlePlaceholder,
  titleLabel,
  descriptionPlaceholder,
  descriptionLabel,
  pricePlaceholder,
  priceLabel,
  removePhotoLabel,
  addPhotoLabel,
  photosHintLabel,
  cancelLabel,
  saveLabel,
  publishLabel,
  priceTrendDownLabel,
  priceTrendUpLabel,
  onToggleEdit,
  onClearText,
  onTitleChange,
  onDescriptionChange,
  onPriceChange,
  onCityChange,
  onPreferredDateChange,
  onPhotoPick,
  onRemovePhoto,
  onCancelEdit,
  onSave,
}: RequestOwnerEditPanelProps) {
  const photoInputRef = React.useRef<HTMLInputElement | null>(null);

  return (
    <section className="request-detail__owner-edit">
      <div className="request-detail__owner-actions">
        <button
          type="button"
          className="offer-action-btn offer-action-btn--icon-only icon-button icon-button--hint"
          data-tooltip={ownerEditLabel}
          aria-label={ownerEditLabel}
          onClick={onToggleEdit}
        >
          <span className="offer-action-btn__icon">
            <IconEdit />
          </span>
        </button>
        <button
          type="button"
          className="offer-action-btn offer-action-btn--icon-only icon-button icon-button--hint"
          data-tooltip={ownerClearLabel}
          aria-label={ownerClearLabel}
          onClick={onClearText}
          disabled={!isEditMode}
        >
          <span className="offer-action-btn__icon">
            <IconTrash />
          </span>
        </button>
      </div>

      <div className="request-detail__owner-field">
        <Input
          value={titleValue}
          onChange={(event) => onTitleChange(event.target.value)}
          maxLength={120}
          disabled={!isEditMode}
          placeholder={titlePlaceholder}
          aria-label={titleLabel}
        />
      </div>

      <div className="request-detail__owner-field">
        <Textarea
          value={descriptionValue}
          onChange={(event) => onDescriptionChange(event.target.value)}
          disabled={!isEditMode}
          placeholder={descriptionPlaceholder}
          aria-label={descriptionLabel}
        />
      </div>

      <div className="request-detail__owner-price-row">
        <Input
          type="number"
          min={1}
          value={priceValue}
          onChange={(event) => onPriceChange(event.target.value)}
          disabled={!isEditMode}
          placeholder={pricePlaceholder}
          aria-label={priceLabel}
        />
        {priceTrend ? (
          <span
            className={`status-badge ${priceTrend === 'up' ? 'status-badge--success' : 'status-badge--warning'}`}
          >
            {priceTrend === 'down' ? '↓' : '↑'} {priceTrend === 'down' ? priceTrendDownLabel : priceTrendUpLabel}
          </span>
        ) : null}
      </div>

      <div className="request-detail__owner-meta-grid">
        <div className="request-detail__owner-field">
          <span className="request-detail__owner-label">{cityLabel}</span>
          <CitySearchSelect
            mode="inline"
            locale={locale}
            value={cityValue}
            onChange={onCityChange}
            placeholder={cityPlaceholder}
            ariaLabel={cityLabel}
            searchPlaceholder={cityPlaceholder}
            disabled={!isEditMode}
          />
        </div>
        <div className="request-detail__owner-field">
          <span className="request-detail__owner-label">{preferredDateLabel}</span>
          <Input
            type="date"
            value={preferredDateValue}
            onChange={(event) => onPreferredDateChange(event.target.value)}
            disabled={!isEditMode}
            aria-label={preferredDateLabel}
          />
        </div>
      </div>

      <div className="request-detail__owner-photos-wrap">
        <input
          ref={photoInputRef}
          type="file"
          className="sr-only"
          accept="image/jpeg,image/png"
          multiple
          onChange={(event) => {
            onPhotoPick(event.target.files);
            event.currentTarget.value = '';
          }}
        />
        <div className="request-detail__owner-photos">
          {Array.from({ length: 4 }).map((_, index) => {
            const src = photos[index];
            if (src) {
              const safeSrc = normalizeAppImageSrc(src);
              return (
                <div key={`${src}-${index}`} className="request-detail__owner-photo">
                  <Image
                    src={safeSrc}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 50vw, 180px"
                    unoptimized={shouldBypassNextImageOptimization(safeSrc)}
                    className="request-detail__owner-photo-img"
                  />
                  {isEditMode ? (
                    <button
                      type="button"
                      className="request-photo__remove"
                      aria-label={removePhotoLabel}
                      onClick={() => onRemovePhoto(index)}
                    >
                      ×
                    </button>
                  ) : null}
                </div>
              );
            }
            if (!isEditMode) {
              return null;
            }
            return (
              <button
                key={`slot-${index}`}
                type="button"
                className="request-detail__owner-photo-slot"
                onClick={() => photoInputRef.current?.click()}
                disabled={!isEditMode || isUploadingPhoto || photos.length >= 4}
                aria-label={addPhotoLabel}
              >
                +
              </button>
            );
          })}
        </div>
        <p className="request-upload__hint">{photosHintLabel}</p>
      </div>

      {isEditMode ? (
        <div className="request-detail__owner-cta">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancelEdit}
            disabled={isSaving}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => onSave('draft')}
            loading={isSaving && activeSubmitIntent === 'draft'}
            disabled={!titleValue.trim() || !cityValue.trim() || !preferredDateValue}
          >
            {saveLabel}
          </Button>
          {showPublishAction ? (
            <Button
              type="button"
              onClick={() => onSave('publish')}
              loading={isSaving && activeSubmitIntent === 'publish'}
              disabled={!titleValue.trim() || !cityValue.trim() || !preferredDateValue}
            >
              {publishLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
