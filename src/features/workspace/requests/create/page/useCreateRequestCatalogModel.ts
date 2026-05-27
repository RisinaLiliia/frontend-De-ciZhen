import * as React from 'react';
import type { Option } from '@/components/ui/Select';
import { useServiceCategories, useServices } from '@/features/catalog/queries';
import { pickI18n } from '@/lib/i18n/helpers';
import type { I18nKey } from '@/lib/i18n/keys';

type Translate = (key: I18nKey) => string;

type Params = {
  locale: 'de' | 'en';
  t: Translate;
  categoryKey: string;
};

export function useCreateRequestCatalogModel({ locale, t, categoryKey }: Params) {
  const { data: categories } = useServiceCategories();
  const { data: services } = useServices();

  const serviceOptions = React.useMemo<Option[]>(
    () => {
      const filtered = categoryKey
        ? (services ?? []).filter((service) => service.categoryKey === categoryKey)
        : [];
      return [
        { value: '', label: t('request.subcategoryPlaceholder') },
        ...filtered
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((service) => ({
            value: service.key,
            label: pickI18n(service.i18n, locale),
          })),
      ];
    },
    [categoryKey, locale, services, t],
  );

  const categoryOptions = React.useMemo<Option[]>(
    () => [
      { value: '', label: t('request.categoryPlaceholder') },
      ...(categories ?? [])
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((category) => ({
          value: category.key,
          label: pickI18n(category.i18n, locale),
        })),
    ],
    [categories, locale, t],
  );

  return {
    services,
    categoryOptions,
    serviceOptions,
  };
}
