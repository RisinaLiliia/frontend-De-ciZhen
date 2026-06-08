import type { WorkspaceStatisticsRange } from '@/lib/api/dto/workspace';
import type { WorkspaceStatisticsDecisionDashboardDto } from './statisticsDecisionDashboard.contract';
import type {
  WorkspaceStatisticsActivitySignalView,
  WorkspaceStatisticsCityRowView,
  WorkspaceStatisticsFunnelItemView,
  WorkspaceStatisticsKpiView,
} from './workspaceStatistics.model';

function exportCsv(rows: string[][], filename: string) {
  const body = rows
    .map((row) =>
      row
        .map((cell) => {
          const safe = String(cell ?? '');
          if (!safe.includes(',') && !safe.includes('"') && !safe.includes('\n')) return safe;
          return `"${safe.replaceAll('"', '""')}"`;
        })
        .join(','),
    )
    .join('\n');

  const blob = new Blob([`${body}\n`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function serializeActivitySignalValue(item: WorkspaceStatisticsActivitySignalView) {
  if (item.marketValue && item.userValue) {
    return `${item.marketValue} | ${item.userValue}`;
  }
  return item.value;
}

export function exportWorkspaceStatisticsCsv(params: {
  activitySignals: WorkspaceStatisticsActivitySignalView[];
  cityRows: WorkspaceStatisticsCityRowView[];
  data: WorkspaceStatisticsDecisionDashboardDto | undefined;
  funnel: WorkspaceStatisticsFunnelItemView[];
  kpis: WorkspaceStatisticsKpiView[];
  range: WorkspaceStatisticsRange;
}) {
  const { activitySignals, cityRows, data, funnel, kpis, range } = params;
  if (!data) return;

  const rows: string[][] = [
    ['section', 'metric', 'value'],
    ...kpis.map((item) => ['kpi', item.label, item.value]),
    ...activitySignals.map((item) => ['activity-signal', item.label, `${serializeActivitySignalValue(item)} (${item.hint})`]),
    ...data.demand.categories.map((item) => ['category-demand', item.categoryName, `${item.sharePercent}% (${item.requestCount})`]),
    ...cityRows.map((item) => [
      'city-demand',
      item.name,
      `${item.count} (job-search=${item.auftragSuchenCount ?? 'n/a'}, provider-search=${item.anbieterSuchenCount ?? 'n/a'}, market-balance=${item.marketBalanceRatio === null ? 'n/a' : `${item.marketBalanceRatio.toFixed(2)}x`}, ${item.signal})`,
    ]),
    ...funnel.map((item) => ['funnel', item.label, item.value]),
  ];

  const filename =
    data.exportMeta?.filename?.trim()
    || `workspace-statistics-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
  exportCsv(rows, filename);
}
