import * as React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  clearRequestDraft,
  readRequestDraft,
  writeRequestDraft,
  type RequestDraft,
} from '@/features/request/createDraft';
import { buildCreateRequestSchema, type CreateRequestValues } from '@/features/request/create.schema';
import { useRequestPhotoItems } from '@/features/request/useRequestPhotoItems';
import type { I18nKey } from '@/lib/i18n/keys';

type Translate = (key: I18nKey) => string;

type Params = {
  t: Translate;
  defaultService: string;
  defaultCity: string;
  preferredDate: string;
  isRecurring: boolean;
};

export function useCreateRequestFormModel({
  t,
  defaultService,
  defaultCity,
  preferredDate,
  isRecurring,
}: Params) {
  const schema = React.useMemo(() => buildCreateRequestSchema(t), [t]);
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateRequestValues>({
    resolver: zodResolver(schema),
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

  const serviceKey = useWatch({ control, name: 'serviceKey' });
  const cityId = useWatch({ control, name: 'cityId' });
  const watchedFormValues = useWatch({ control });
  const titleValue = useWatch({ control, name: 'title' }) ?? '';
  const descriptionValue = useWatch({ control, name: 'description' }) ?? '';
  const propertyType = useWatch({ control, name: 'propertyType' });
  const isRecurringValue = useWatch({ control, name: 'isRecurring' });
  const preferredDateValue = useWatch({ control, name: 'preferredDate' }) ?? '';

  const { photoItems, onFilesSelected, removePhotoAt } = useRequestPhotoItems({
    photosErrorMessage: t('request.photosError'),
    photosLimitMessage: t('request.photosLimit'),
  });

  const [tagInput, setTagInput] = React.useState('');
  const [tags, setTags] = React.useState<string[]>([]);
  const [activeSubmitIntent, setActiveSubmitIntent] = React.useState<'draft' | 'publish' | null>(null);
  const [categoryKey, setCategoryKey] = React.useState('');
  const draftRestoredRef = React.useRef(false);

  React.useEffect(() => {
    setValue('tags', tags.length ? tags : undefined);
  }, [setValue, tags]);

  React.useEffect(() => {
    if (typeof window === 'undefined' || draftRestoredRef.current) return;
    draftRestoredRef.current = true;
    const draft = readRequestDraft();
    if (!draft) return;

    const values = draft.values;
    if (typeof values.serviceKey === 'string') setValue('serviceKey', values.serviceKey);
    if (typeof values.cityId === 'string') setValue('cityId', values.cityId);
    if (typeof values.title === 'string') setValue('title', values.title);
    if (values.propertyType === 'apartment' || values.propertyType === 'house') {
      setValue('propertyType', values.propertyType);
    }
    if (typeof values.area === 'number' && Number.isFinite(values.area)) setValue('area', values.area);
    if (typeof values.price === 'number' && Number.isFinite(values.price)) {
      setValue('price', values.price);
    } else if (values.price === null || values.price === undefined) {
      setValue('price', undefined);
    }
    if (typeof values.preferredDate === 'string') setValue('preferredDate', values.preferredDate);
    if (typeof values.isRecurring === 'boolean') setValue('isRecurring', values.isRecurring);
    if (typeof values.description === 'string') setValue('description', values.description);

    if (Array.isArray(draft.tags)) {
      const safeTags = draft.tags.filter((item): item is string => typeof item === 'string');
      setTags(safeTags);
      setValue('tags', safeTags.length ? safeTags : undefined);
    }
    if (typeof draft.categoryKey === 'string') {
      setCategoryKey(draft.categoryKey);
    }
  }, [setValue]);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !draftRestoredRef.current) return;
    const payload: RequestDraft = {
      values: {
        serviceKey: watchedFormValues.serviceKey ?? '',
        cityId: watchedFormValues.cityId ?? '',
        title: watchedFormValues.title ?? '',
        propertyType: watchedFormValues.propertyType ?? 'apartment',
        area:
          typeof watchedFormValues.area === 'number' && Number.isFinite(watchedFormValues.area)
            ? watchedFormValues.area
            : 50,
        price:
          typeof watchedFormValues.price === 'number' && Number.isFinite(watchedFormValues.price)
            ? watchedFormValues.price
            : undefined,
        preferredDate: watchedFormValues.preferredDate ?? '',
        isRecurring: Boolean(watchedFormValues.isRecurring),
        description: watchedFormValues.description ?? '',
      },
      tags,
      categoryKey,
      savedAt: Date.now(),
    };
    writeRequestDraft(payload);
  }, [categoryKey, tags, watchedFormValues]);

  const isCleaningCategory = React.useMemo(() => {
    const key = `${categoryKey} ${serviceKey}`.toLowerCase();
    return key.includes('clean');
  }, [categoryKey, serviceKey]);

  const addTag = React.useCallback((value: string) => {
    const clean = value.trim();
    if (!clean) return;
    setTags((prev) => {
      if (prev.includes(clean)) return prev;
      return [...prev, clean];
    });
    setTagInput('');
  }, []);

  return {
    register,
    handleSubmit,
    setValue,
    control,
    errors,
    isSubmitting,
    serviceKey,
    cityId,
    titleValue,
    descriptionValue,
    propertyType,
    isRecurringValue,
    preferredDateValue,
    photoItems,
    onFilesSelected,
    removePhotoAt,
    tagInput,
    setTagInput,
    tags,
    setTags,
    categoryKey,
    setCategoryKey,
    isCleaningCategory,
    activeSubmitIntent,
    setActiveSubmitIntent,
    addTag,
    clearDraft: clearRequestDraft,
  };
}
