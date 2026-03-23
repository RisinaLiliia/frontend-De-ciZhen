/* src/components/home/useHomePlatformActivityPanel.ts */
'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  getPlatformActivity,
  type PlatformActivityRange,
} from '@/lib/api/analytics';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import {
  buildHomePlatformActivityViewModel,
  resolveHomePlatformActivityDefaultIndex,
  type HomePlatformActivityPanelViewModel,
} from '@/components/home/homePlatformActivityPanel.model';

type Translator = (key: I18nKey) => string;

type UseHomePlatformActivityPanelParams = {
  t: Translator;
  locale: Locale;
};

type UseHomePlatformActivityPanelResult = HomePlatformActivityPanelViewModel & {
  onRangeChange: (next: PlatformActivityRange) => void;
  onHoverPoint: (index: number) => void;
};

export function useHomePlatformActivityPanel({
  t,
  locale,
}: UseHomePlatformActivityPanelParams): UseHomePlatformActivityPanelResult {
  const [range, setRange] = React.useState<PlatformActivityRange>('7d');
  const [activeIndex, setActiveIndex] = React.useState(0);

  const query = useQuery({
    queryKey: ['home-platform-activity', range],
    queryFn: () => getPlatformActivity(range),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
    placeholderData: (previousData) => previousData,
  });

  const points = query.data?.data ?? [];

  React.useEffect(() => {
    setActiveIndex(resolveHomePlatformActivityDefaultIndex(points.length));
  }, [points.length, range]);

  return React.useMemo(
    () => ({
      ...buildHomePlatformActivityViewModel({
        t,
        locale,
        range,
        response: query.data,
        activeIndex,
        isLoading: query.isLoading,
        isError: query.isError,
        isFetching: query.isFetching,
      }),
      onRangeChange: setRange,
      onHoverPoint: setActiveIndex,
    }),
    [
      activeIndex,
      locale,
      query.data,
      query.isError,
      query.isFetching,
      query.isLoading,
      range,
      t,
    ],
  );
}
