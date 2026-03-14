import * as React from 'react';
import Image from 'next/image';
import type { UseFormRegister } from 'react-hook-form';
import { Field } from '@/components/ui/Field';
import { FormLabel } from '@/components/ui/FormLabel';
import { Input } from '@/components/ui/Input';
import { Select, type Option } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { IconChevronDown } from '@/components/ui/icons/icons';
import { IconBriefcase } from '@/components/ui/Icons';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { CreateRequestValues } from '@/features/request/create.schema';
import type { RequestPhotoItem } from '@/features/request/useRequestPhotoItems';

type Translate = (key: I18nKey) => string;

type CreateRequestBasicsSectionProps = {
  t: Translate;
  requiredHint: string;
  register: UseFormRegister<CreateRequestValues>;
  categoryKey: string;
  serviceKey: string;
  categoryOptions: Option[];
  serviceOptions: Option[];
  titleValue: string;
  descriptionValue: string;
  serviceError?: string;
  titleError?: string;
  photoItems: RequestPhotoItem[];
  onCategoryChange: (value: string) => void;
  onServiceChange: (value: string) => void;
  onPhotosSelected: (files: FileList | null) => void | Promise<void>;
  onPhotoRemove: (index: number) => void;
};

export function CreateRequestBasicsSection({
  t,
  requiredHint,
  register,
  categoryKey,
  serviceKey,
  categoryOptions,
  serviceOptions,
  titleValue,
  descriptionValue,
  serviceError,
  titleError,
  photoItems,
  onCategoryChange,
  onServiceChange,
  onPhotosSelected,
  onPhotoRemove,
}: CreateRequestBasicsSectionProps) {
  return (
    <section className="request-section">
      <div className="request-section__header">
        <h2 className="section-title">{t(I18N_KEYS.request.sectionBasicsTitle)}</h2>
        <p className="section-subtitle">{t(I18N_KEYS.request.sectionBasicsSubtitle)}</p>
      </div>

      <div className="form-group">
        <FormLabel required requiredHint={requiredHint}>
          {t(I18N_KEYS.request.categoryLabel)}
        </FormLabel>
        <Field leftIcon={<IconBriefcase />} rightIcon={<IconChevronDown />}>
          <Select
            value={categoryKey}
            onChange={onCategoryChange}
            options={categoryOptions}
            aria-label={t(I18N_KEYS.request.categoryLabel)}
          />
        </Field>
      </div>

      <div className="form-group">
        <FormLabel required requiredHint={requiredHint}>
          {t(I18N_KEYS.request.subcategoryLabel)}
        </FormLabel>
        <input type="hidden" value={serviceKey} readOnly {...register('serviceKey')} />
        <Field rightIcon={<IconChevronDown />}>
          <Select
            value={serviceKey}
            onChange={onServiceChange}
            options={serviceOptions}
            aria-label={t(I18N_KEYS.request.subcategoryLabel)}
            disabled={!categoryKey}
          />
        </Field>
        {serviceError ? (
          <p className="text-red-600 text-sm">{serviceError}</p>
        ) : null}
      </div>

      <div className="form-group">
        <div className="request-form__meta">
          <FormLabel required requiredHint={requiredHint}>
            {t(I18N_KEYS.request.titleLabel)}
          </FormLabel>
          <span className="form-counter">{titleValue.length}/120</span>
        </div>
        <Field>
          <Input
            {...register('title')}
            placeholder={t(I18N_KEYS.request.titlePlaceholder)}
            aria-invalid={titleError ? 'true' : 'false'}
          />
        </Field>
        {titleError ? <p className="text-red-600 text-sm">{titleError}</p> : null}
      </div>

      <div className="form-group">
        <div className="request-form__meta">
          <label className="typo-small">{t(I18N_KEYS.request.descriptionLabel)}</label>
          <span className="form-counter">{descriptionValue.length}/2000</span>
        </div>
        <Field>
          <Textarea
            {...register('description')}
            placeholder={t(I18N_KEYS.request.descriptionPlaceholder)}
          />
        </Field>
      </div>

      <div className="form-group">
        <label className="typo-small">{t(I18N_KEYS.request.photosLabel)}</label>
        <div className="request-upload">
          <div className="request-upload__actions">
            <input
              id="request-photos"
              type="file"
              accept="image/jpeg,image/png"
              multiple
              onChange={(event) => {
                onPhotosSelected(event.target.files);
                event.currentTarget.value = '';
              }}
              className="sr-only"
            />
            <label htmlFor="request-photos" className="btn-secondary">
              {t(I18N_KEYS.request.photosButton)}
            </label>
          </div>
          <p className="request-upload__hint">{t(I18N_KEYS.request.photosHint)}</p>
        </div>

        {photoItems.length ? (
          <div className="request-photos">
            {photoItems.map((item, index) => (
              <div key={item.previewUrl} className="request-photo">
                <Image
                  src={item.previewUrl}
                  alt=""
                  fill
                  className="request-photo__img"
                  sizes="(min-width: 768px) 33vw, 50vw"
                  unoptimized
                />
                <button
                  type="button"
                  className="request-photo__remove"
                  onClick={() => onPhotoRemove(index)}
                  aria-label={t(I18N_KEYS.request.removePhoto)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
