import { IconCheck, IconClock } from '@/components/ui/icons/icons';

type ProfileDecisionMetricsProps = {
  responseTime?: string;
  responseRate?: number;
  responseTimeLabel?: string;
  responseRateLabel?: string;
  className?: string;
};

export function ProfileDecisionMetrics({
  responseTime,
  responseRate,
  responseTimeLabel,
  responseRateLabel,
  className,
}: ProfileDecisionMetricsProps) {
  const hasTime = Boolean(responseTime);
  const hasRate = typeof responseRate === 'number';
  if (!hasTime && !hasRate) return null;

  return (
      <div className={`profile-decision-metrics ${className ?? ''}`.trim()}>
      {hasTime ? (
        <span className="profile-decision-metric">
          <span className="profile-decision-metric__icon" aria-hidden="true">
            <IconClock />
          </span>
          {responseTimeLabel ? <span className="profile-decision-metric__label">{responseTimeLabel}:</span> : null}
          <span className="profile-decision-metric__value">{responseTime}</span>
        </span>
      ) : null}
      {hasRate ? (
        <span className="profile-decision-metric">
          <span className="profile-decision-metric__icon" aria-hidden="true">
            <IconCheck />
          </span>
          {responseRateLabel ? <span className="profile-decision-metric__label">{responseRateLabel}:</span> : null}
          <span className="profile-decision-metric__value">{responseRate}%</span>
        </span>
      ) : null}
    </div>
  );
}
