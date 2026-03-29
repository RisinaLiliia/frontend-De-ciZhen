'use client';

type StatisticsCompareValueProps = {
  className?: string;
  marketValue: string;
  userValue: string;
};

export function StatisticsCompareValue({
  className,
  marketValue,
  userValue,
}: StatisticsCompareValueProps) {
  return (
    <span className={`workspace-statistics-compare-value${className ? ` ${className}` : ''}`.trim()} role="text">
      <span className="workspace-statistics-compare-value__market">{marketValue}</span>
      <span className="workspace-statistics-compare-value__separator" aria-hidden="true">|</span>
      <span className="workspace-statistics-compare-value__user">{userValue}</span>
    </span>
  );
}
