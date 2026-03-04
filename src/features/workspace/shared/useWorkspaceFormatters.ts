'use client';

import * as React from 'react';

export function useWorkspaceFormatters(locale: string) {
  const localeTag = locale === 'de' ? 'de-DE' : 'en-US';

  const formatNumber = React.useMemo(() => new Intl.NumberFormat(localeTag), [localeTag]);

  const formatDate = React.useMemo(
    () =>
      new Intl.DateTimeFormat(localeTag, {
        day: '2-digit',
        month: 'short',
      }),
    [localeTag],
  );

  const formatPrice = React.useMemo(
    () =>
      new Intl.NumberFormat(localeTag, {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }),
    [localeTag],
  );

  const chartMonthLabel = React.useMemo(
    () => new Intl.DateTimeFormat(localeTag, { month: 'short' }),
    [localeTag],
  );

  return { localeTag, formatNumber, formatDate, formatPrice, chartMonthLabel };
}
