'use client';

type StatisticsContextPanelProps = {
  className?: string;
  showControls?: boolean;
};

export function StatisticsContextPanel({
  className,
}: StatisticsContextPanelProps) {
  return className ? <div className={className} hidden /> : null;
}
