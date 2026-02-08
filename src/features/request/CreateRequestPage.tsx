// src/features/request/CreateRequestPage.tsx
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { IconCalendar, IconChevronDown, IconPin } from '@/components/ui/icons/icons';
import { IconBriefcase, IconCoins } from '@/components/ui/Icons';
import { useCities, useServiceCategories, useServices } from '@/features/catalog/queries';
import { pickI18n } from '@/lib/i18n/helpers';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { createRequest, publishMyRequest, uploadRequestPhotos } from '@/lib/api/requests';
import { parseScheduleParam } from '@/features/request/schedule';
import {
  createRequestSchema,
  type CreateRequestValues,
} from '@/features/request/create.schema';

function CreateRequestContent() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useI18n();

  const schedule = parseScheduleParam(searchParams.get('schedule') ?? undefined);
  const defaultService = searchParams.get('service') ?? '';
  const defaultCity = searchParams.get('city') ?? '';

  const isRecurring = schedule?.mode === 'recurring';
  const preferredDate =
    schedule?.mode === 'recurring'
      ? schedule.startDate
      : schedule?.mode === 'once'
        ? schedule.date
        : '';

  const { data: cities } = useCities('DE');
  const { data: categories } = useServiceCategories();
  const { data: services } = useServices();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateRequestValues>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      serviceKey: defaultService,
      cityId: defaultCity,
      title: '',
      propertyType: 'apartment',
      area: 50,
      price: undefined,
      preferredDate,
      isRecurring,
      description: '',
      photos: [],
      tags: [],
    },
  });

  const serviceKey = watch('serviceKey');
  const cityId = watch('cityId');
  const titleValue = watch('title') ?? '';
  const descriptionValue = watch('description') ?? '';

  const [photoItems, setPhotoItems] = React.useState<
    Array<{ file: File; previewUrl: string }>
  >([]);
  const [tagInput, setTagInput] = React.useState('');
  const [tags, setTags] = React.useState<string[]>([]);

  React.useEffect(() => {
    setValue('tags', tags.length ? tags : undefined);
  }, [tags, setValue]);

  const [categoryKey, setCategoryKey] = React.useState('');

  const selectedService = React.useMemo(
    () => (services ?? []).find((service) => service.key === serviceKey),
    [services, serviceKey],
  );

  React.useEffect(() => {
    if (categoryKey) return;
    if (!serviceKey || !services) return;
    const service = services.find((item) => item.key === serviceKey);
    if (service) setCategoryKey(service.categoryKey);
  }, [categoryKey, serviceKey, services]);

  const isCleaningCategory = React.useMemo(() => {
    const key = `${categoryKey} ${serviceKey}`.toLowerCase();
    return key.includes('clean');
  }, [categoryKey, serviceKey]);

  const onSubmit = async (values: CreateRequestValues) => {
    try {
      const preferredDateIso = values.preferredDate
        ? new Date(values.preferredDate).toISOString()
        : values.preferredDate;
      const uploads =
        photoItems.length > 0
          ? await uploadRequestPhotos(photoItems.map((item) => item.file))
          : { urls: [] };
      const res = await createRequest({
        ...values,
        preferredDate: preferredDateIso,
        description: values.description?.trim() || undefined,
        photos: uploads.urls.length ? uploads.urls : undefined,
        tags: values.tags?.length ? values.tags : undefined,
        price: values.price ?? undefined,
      });
      await publishMyRequest(res.id);
      toast.success(t(I18N_KEYS.request.published));
      router.push('/client/requests');
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    }
  };

  const serviceOptions = React.useMemo(
    () => {
      const filtered = categoryKey
        ? (services ?? []).filter((s) => s.categoryKey === categoryKey)
        : [];
      return [
        { value: '', label: t(I18N_KEYS.request.subcategoryPlaceholder) },
        ...filtered
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((s) => ({
            value: s.key,
            label: pickI18n(s.i18n, locale),
          })),
      ];
    },
    [services, locale, t, categoryKey],
  );

  const categoryOptions = React.useMemo(
    () => [
      { value: '', label: t(I18N_KEYS.request.categoryPlaceholder) },
      ...(categories ?? [])
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((c) => ({
          value: c.key,
          label: pickI18n(c.i18n, locale),
        })),
    ],
    [categories, locale, t],
  );

  const cityOptions = React.useMemo(
    () => [
      { value: '', label: t(I18N_KEYS.home.cityPlaceholder) },
      ...(cities ?? []).map((c) => ({
        value: c.id,
        label: pickI18n(c.i18n, locale),
      })),
    ],
    [cities, locale, t],
  );

  const validateImage = React.useCallback(async (file: File) => {
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error(t(I18N_KEYS.request.photosError));
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t(I18N_KEYS.request.photosError));
      return false;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    const loaded = await new Promise<boolean>((resolve) => {
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
    const isValid = loaded && img.width >= 300 && img.height >= 300;
    URL.revokeObjectURL(url);
    if (!isValid) {
      toast.error(t(I18N_KEYS.request.photosError));
      return false;
    }
    return true;
  }, [t]);

  const onFilesSelected = async (files: FileList | null) => {
    if (!files) return;
    const incoming = Array.from(files);
    const availableSlots = 8 - photoItems.length;
    if (availableSlots <= 0) {
      toast.message(t(I18N_KEYS.request.photosLimit));
      return;
    }
    const nextFiles = incoming.slice(0, availableSlots);
    const validated: Array<{ file: File; previewUrl: string }> = [];
    for (const file of nextFiles) {
      // eslint-disable-next-line no-await-in-loop
      const ok = await validateImage(file);
      if (!ok) continue;
      const previewUrl = URL.createObjectURL(file);
      validated.push({ file, previewUrl });
    }
    if (validated.length) {
      setPhotoItems((prev) => [...prev, ...validated]);
    }
  };

  React.useEffect(() => {
    return () => {
      photoItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [photoItems]);

  const addTag = (value: string) => {
    const clean = value.trim();
    if (!clean) return;
    if (tags.includes(clean)) {
      setTagInput('');
      return;
    }
    setTags((prev) => [...prev, clean]);
    setTagInput('');
  };

  return (
    <PageShell right={<AuthActions />} withSpacer={false}>
      <div className="container-mobile request-create">
        <section className="text-center stack-sm">
          <h1 className="typo-h1">{t(I18N_KEYS.request.title)}</h1>
          <p className="typo-muted">{t(I18N_KEYS.request.subtitle)}</p>
        </section>

        <form className="card request-form" onSubmit={handleSubmit(onSubmit)}>
          <section className="request-section">
            <div className="request-section__header">
              <h2 className="section-title">{t(I18N_KEYS.request.sectionBasicsTitle)}</h2>
              <p className="section-subtitle">{t(I18N_KEYS.request.sectionBasicsSubtitle)}</p>
            </div>

            <div className="form-group">
              <label className="typo-small">{t(I18N_KEYS.request.categoryLabel)}</label>
              <Field leftIcon={<IconBriefcase />} rightIcon={<IconChevronDown />}>
                <Select
                  value={categoryKey}
                  onChange={(value) => {
                    setCategoryKey(value);
                    setValue('serviceKey', '');
                  }}
                  options={categoryOptions}
                  aria-label={t(I18N_KEYS.request.categoryLabel)}
                />
              </Field>
            </div>

            <div className="form-group">
              <label className="typo-small">{t(I18N_KEYS.request.subcategoryLabel)}</label>
              <Field rightIcon={<IconChevronDown />}>
                <Select
                  value={serviceKey}
                  onChange={(value) => setValue('serviceKey', value)}
                  options={serviceOptions}
                  aria-label={t(I18N_KEYS.request.subcategoryLabel)}
                  disabled={!categoryKey}
                />
              </Field>
              {errors.serviceKey ? (
                <p className="text-red-600 text-sm">{errors.serviceKey.message}</p>
              ) : null}
            </div>

            <div className="form-group">
              <div className="request-form__meta">
                <label className="typo-small">{t(I18N_KEYS.request.titleLabel)}</label>
                <span className="form-counter">{titleValue.length}/120</span>
              </div>
              <Field>
                <Input
                  {...register('title')}
                  placeholder={t(I18N_KEYS.request.titlePlaceholder)}
                  aria-invalid={errors.title ? 'true' : 'false'}
                />
              </Field>
              {errors.title ? <p className="text-red-600 text-sm">{errors.title.message}</p> : null}
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
                      void onFilesSelected(event.target.files);
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
                      <img src={item.previewUrl} alt="" loading="lazy" />
                      <button
                        type="button"
                        className="request-photo__remove"
                        onClick={() => {
                          URL.revokeObjectURL(item.previewUrl);
                          setPhotoItems((prev) => prev.filter((_, i) => i !== index));
                        }}
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

          <section className="request-section">
            <div className="request-section__header">
              <h2 className="section-title">{t(I18N_KEYS.request.sectionDetailsTitle)}</h2>
              <p className="section-subtitle">{t(I18N_KEYS.request.sectionDetailsSubtitle)}</p>
            </div>

            <div className="form-group">
              <label className="typo-small">{t(I18N_KEYS.home.cityAria)}</label>
              <Field leftIcon={<IconPin />} rightIcon={<IconChevronDown />}>
                <Select
                  value={cityId}
                  onChange={(value) => setValue('cityId', value)}
                  options={cityOptions}
                  aria-label={t(I18N_KEYS.home.cityAria)}
                />
              </Field>
              {errors.cityId ? (
                <p className="text-red-600 text-sm">{errors.cityId.message}</p>
              ) : null}
            </div>

            <div className="request-form__row is-2">
              <div className="form-group">
                <label className="typo-small">{t(I18N_KEYS.request.preferredDate)}</label>
                <Field leftIcon={<IconCalendar />}>
                  <Input type="datetime-local" {...register('preferredDate')} />
                </Field>
                {errors.preferredDate ? (
                  <p className="text-red-600 text-sm">{errors.preferredDate.message}</p>
                ) : null}
              </div>
              <div className="form-group">
                <label className="typo-small">{t(I18N_KEYS.request.priceLabel)}</label>
                <Field leftIcon={<IconCoins />}>
                  <Input
                    type="number"
                    min={1}
                    placeholder={t(I18N_KEYS.request.pricePlaceholder)}
                    {...register('price', {
                      setValueAs: (value) =>
                        value === '' || value === undefined ? undefined : Number(value),
                    })}
                  />
                </Field>
              </div>
            </div>

            {isCleaningCategory ? (
              <>
                <div className="request-form__row is-2">
                  <div className="form-group">
                    <label className="typo-small">{t(I18N_KEYS.request.propertyType)}</label>
                    <Field rightIcon={<IconChevronDown />}>
                      <Select
                        value={watch('propertyType')}
                        onChange={(value) =>
                          setValue('propertyType', value as CreateRequestValues['propertyType'])
                        }
                        options={[
                          { value: 'apartment', label: t(I18N_KEYS.request.propertyApartment) },
                          { value: 'house', label: t(I18N_KEYS.request.propertyHouse) },
                        ]}
                      />
                    </Field>
                  </div>
                  <div className="form-group">
                    <label className="typo-small">{t(I18N_KEYS.request.area)}</label>
                    <Field>
                      <Input
                        type="number"
                        min={10}
                        {...register('area', { valueAsNumber: true })}
                      />
                    </Field>
                    {errors.area ? (
                      <p className="text-red-600 text-sm">{errors.area.message}</p>
                    ) : null}
                  </div>
                </div>

                <div className="form-group">
                  <label className="typo-small">{t(I18N_KEYS.request.recurring)}</label>
                  <Field rightIcon={<IconChevronDown />}>
                    <Select
                      value={watch('isRecurring') ? 'recurring' : 'once'}
                      onChange={(value) => setValue('isRecurring', value === 'recurring')}
                      options={[
                        { value: 'once', label: t(I18N_KEYS.request.modeOnce) },
                        { value: 'recurring', label: t(I18N_KEYS.request.modeRecurring) },
                      ]}
                    />
                  </Field>
                </div>
              </>
            ) : null}

            <div className="form-group">
              <label className="typo-small">{t(I18N_KEYS.request.tagsLabel)}</label>
              <div className="request-tags">
                {tags.map((tag) => (
                  <span key={tag} className="request-tag-chip">
                    {tag}
                    <button type="button" onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}>
                      ×
                    </button>
                  </span>
                ))}
                <Input
                  className="request-tag-input"
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ',') {
                      event.preventDefault();
                      addTag(tagInput);
                    }
                  }}
                  onBlur={() => addTag(tagInput)}
                  placeholder={t(I18N_KEYS.request.tagsPlaceholder)}
                />
              </div>
            </div>
          </section>

          <div className="request-actions">
            <p className="typo-small text-center">{t(I18N_KEYS.request.hint)}</p>
            <Button type="submit" loading={isSubmitting}>
              {t(I18N_KEYS.request.submitPublish)}
            </Button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}

export function CreateRequestPage() {
  return (
    <React.Suspense fallback={null}>
      <CreateRequestContent />
    </React.Suspense>
  );
}
