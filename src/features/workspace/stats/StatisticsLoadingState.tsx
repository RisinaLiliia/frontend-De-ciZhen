'use client';

export function StatisticsLoadingState() {
  return (
    <div className="requests-stats__loading workspace-statistics__loading">
      <div className="skeleton h-20 w-full" />
      <div className="skeleton h-64 w-full" />
      <div className="skeleton h-64 w-full" />
    </div>
  );
}
