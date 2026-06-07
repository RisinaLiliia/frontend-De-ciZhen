import { IconCheck, IconClock } from '@/components/ui/icons/icons';

type ProviderDecisionMetricsProps = {
  responseTime?: string;
  responseRate?: number;
  responseTimeLabel?: string;
  responseRateLabel?: string;
  className?: string;
};

export function ProviderDecisionMetrics({
  responseTime,
  responseRate,
  responseTimeLabel,
  responseRateLabel,
  className,
}: ProviderDecisionMetricsProps) {
  const hasTime = Boolean(responseTime);
  const hasRate = typeof responseRate === 'number';
  if (!hasTime && !hasRate) return null;

  return (
    <div className={`provider-decision-metrics ${className ?? ''}`.trim()}>
      {hasTime ? (
        <span className="provider-decision-metric">
          <span className="provider-decision-metric__icon" aria-hidden="true">
            <IconClock />
          </span>
          {responseTimeLabel ? <span className="provider-decision-metric__label">{responseTimeLabel}:</span> : null}
          <span className="provider-decision-metric__value">{responseTime}</span>
        </span>
      ) : null}
      {hasRate ? (
        <span className="provider-decision-metric">
          <span className="provider-decision-metric__icon" aria-hidden="true">
            <IconCheck />
          </span>
          {responseRateLabel ? <span className="provider-decision-metric__label">{responseRateLabel}:</span> : null}
          <span className="provider-decision-metric__value">{responseRate}%</span>
        </span>
      ) : null}
    </div>
  );
}
