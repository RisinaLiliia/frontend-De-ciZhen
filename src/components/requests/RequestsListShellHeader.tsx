'use client';

import { RequestsFilters } from '@/components/requests/RequestsFilters';
import { RequestsResultsSummary } from '@/components/requests/RequestsResultsSummary';
import type { I18nKey } from '@/lib/i18n/keys';
import type { RequestsListDensity } from '@/lib/requests/pagination';

type RequestsListHeaderControls = {
  resultsCount?: boolean;
  densityToggle?: boolean;
  pagination?: boolean;
};

export type RequestsListShellHeaderMode =
  | { kind: 'filters' }
  | { kind: 'summary'; controls?: RequestsListHeaderControls }
  | { kind: 'none' };

type Props = {
  t: (key: I18nKey) => string;
  filtersProps: React.ComponentProps<typeof RequestsFilters>;
  page: number;
  totalPages: number;
  resultsLabel: string;
  listDensity: RequestsListDensity;
  onPrevPage: () => void;
  onNextPage: () => void;
  onListDensityChange?: (value: RequestsListDensity) => void;
  header: RequestsListShellHeaderMode;
};

export function RequestsFiltersHeader({
  filtersProps,
  page,
  totalPages,
  resultsLabel,
  listDensity,
  onPrevPage,
  onNextPage,
  onListDensityChange,
}: Omit<Props, 't' | 'header'>) {
  return (
    <RequestsFilters
      {...filtersProps}
      resultsLabel={resultsLabel}
      page={page}
      totalPages={totalPages}
      onPrevPage={onPrevPage}
      onNextPage={onNextPage}
      listDensity={listDensity}
      onListDensityChange={onListDensityChange}
    />
  );
}

export function RequestsSummaryHeader({
  t,
  filtersProps,
  page,
  totalPages,
  resultsLabel,
  listDensity,
  onPrevPage,
  onNextPage,
  onListDensityChange,
  header,
}: Props & { header: Extract<RequestsListShellHeaderMode, { kind: 'summary' }> }) {
  return (
    <RequestsResultsSummary
      t={t}
      totalResults={filtersProps.totalResults}
      resultsLabel={resultsLabel}
      page={page}
      totalPages={totalPages}
      isPending={filtersProps.isPending}
      listDensity={listDensity}
      onPrevPage={onPrevPage}
      onNextPage={onNextPage}
      onListDensityChange={onListDensityChange}
      controls={header.controls}
    />
  );
}

export function RequestsListShellHeader(props: Props) {
  if (props.header.kind === 'none') {
    return null;
  }

  if (props.header.kind === 'filters') {
    return (
      <RequestsFiltersHeader
        filtersProps={props.filtersProps}
        page={props.page}
        totalPages={props.totalPages}
        resultsLabel={props.resultsLabel}
        listDensity={props.listDensity}
        onPrevPage={props.onPrevPage}
        onNextPage={props.onNextPage}
        onListDensityChange={props.onListDensityChange}
      />
    );
  }

  return <RequestsSummaryHeader {...props} header={props.header} />;
}
