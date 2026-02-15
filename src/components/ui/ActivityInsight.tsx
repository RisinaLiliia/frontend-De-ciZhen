type ActivityInsightProps = {
  text: string;
  progressPercent: number;
  className?: string;
};

export function ActivityInsight({
  text,
  progressPercent,
  className,
}: ActivityInsightProps) {
  const clamped = Math.max(0, Math.min(100, progressPercent));

  return (
    <div className={`activity-insight ${className ?? ''}`.trim()}>
      <p className="activity-insight__text">{text}</p>
      <span className="activity-insight__track" aria-hidden="true">
        <span className="activity-insight__fill" style={{ width: `${clamped}%` }} />
      </span>
    </div>
  );
}

