'use client';

import Link from 'next/link';

import { WorkspaceRightRailPanel } from './WorkspaceRightRailPanel';

export type WorkspaceUnifiedRailAction =
  | {
      kind: 'link';
      label: string;
      href: string;
      prefetch?: boolean;
    }
  | {
      kind: 'button';
      label: string;
      onClick: () => void;
      disabled?: boolean;
    };

export type WorkspaceUnifiedRailQueueItem = {
  id: string;
  title: string;
  meta: string;
  priorityTone?: 'high' | 'medium' | 'low' | 'neutral';
  priorityVariant?: 'risk' | 'chance' | 'trend' | 'success' | 'neutral';
  priorityLabel?: string | null;
  action: WorkspaceUnifiedRailAction;
  isActive?: boolean;
};

export type WorkspaceUnifiedRailRecommendationItem = {
  id: string;
  title: string;
  description: string;
  metric?: string | number | null;
  tone?: 'neutral' | 'attention' | 'positive' | 'opportunity';
};

export type WorkspaceUnifiedRailVisualization = 'donut' | 'none';
export type WorkspaceUnifiedRailMetricIcon = 'requests' | 'providers' | 'responseRate' | 'responseTime';
export type WorkspaceUnifiedRailMetricTone = 'primary' | 'success' | 'warning' | 'accent' | 'neutral';

export type WorkspaceUnifiedRailModel = {
  decisionPanel: {
    eyebrow: string;
    value: string | number;
    contextLabel: string;
    title: string;
    layout?: 'default' | 'metricGrid';
    visualization?: WorkspaceUnifiedRailVisualization;
    metrics: Array<{
      key: string;
      label: string;
      value: string | number;
      icon?: WorkspaceUnifiedRailMetricIcon;
      tone?: WorkspaceUnifiedRailMetricTone;
    }>;
    primaryAction?: WorkspaceUnifiedRailAction | null;
    secondaryAction?: WorkspaceUnifiedRailAction | null;
  };
  actionQueue: {
    eyebrow: string;
    title: string;
    items: WorkspaceUnifiedRailQueueItem[];
    emptyText: string;
    footerAction?: WorkspaceUnifiedRailAction | null;
  };
  recommendations: {
    eyebrow: string;
    title: string;
    items: WorkspaceUnifiedRailRecommendationItem[];
    emptyText?: string;
    footerAction?: WorkspaceUnifiedRailAction | null;
  };
};

type Props = {
  model?: WorkspaceUnifiedRailModel | null;
  isLoading?: boolean;
  className?: string;
};

function normalizeMetricValue(value: string | number) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, value);
  }

  const normalized = Number(String(value).replace(',', '.').replace(/[^\d.]/g, ''));
  return Number.isFinite(normalized) ? Math.max(0, normalized) : 0;
}

function buildDecisionChartStyle(metrics: WorkspaceUnifiedRailModel['decisionPanel']['metrics']) {
  const normalizedValues = metrics.map((item) => normalizeMetricValue(item.value));
  const total = normalizedValues.reduce((sum, value) => sum + value, 0);
  const safeTotal = total > 0 ? total : Math.max(1, metrics.length);
  let offset = 0;
  const segments = normalizedValues.map((value, index) => {
    const share = ((total > 0 ? value : 1) / safeTotal) * 100;
    const start = offset;
    const end = offset + share;
    offset = end;
    return `var(--workspace-rail-chart-tone-${index + 1}) ${start}% ${end}%`;
  });

  return {
    '--workspace-rail-chart-gradient': `conic-gradient(${segments.join(', ')})`,
  } as React.CSSProperties;
}

function renderMetricIcon(icon: WorkspaceUnifiedRailMetricIcon | undefined) {
  if (icon === 'providers') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8.5 11a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" />
        <path d="M15.5 10.5a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4Z" />
        <path d="M3.8 19.5a5.2 5.2 0 0 1 9.4-3.1" />
        <path d="M12.3 19.5a4.4 4.4 0 0 1 7.9-2.7" />
      </svg>
    );
  }

  if (icon === 'responseRate') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m4 15 4-4 3 3 7-8" />
        <path d="M16 6h2v2" />
        <path d="M4 20h16" />
      </svg>
    );
  }

  if (icon === 'responseTime') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17Z" />
        <path d="M12 8v4.4l3 1.8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 5.5h9.5L18 8v10.5H6v-13Z" />
      <path d="M15.5 5.5V8H18" />
      <path d="M8.5 12h7" />
      <path d="M8.5 15h5" />
    </svg>
  );
}

function renderInlineAction(
  action: WorkspaceUnifiedRailAction,
  className: string,
) {
  if (action.kind === 'link') {
    return (
      <Link href={action.href} prefetch={action.prefetch ?? false} className={className}>
        {action.label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={action.onClick}
      disabled={action.disabled}
    >
      {action.label}
    </button>
  );
}

function renderQueueItem(item: WorkspaceUnifiedRailQueueItem) {
  const priorityClassName = item.priorityVariant ?? item.priorityTone ?? 'neutral';
  const content = (
    <>
      <span className={`workspace-unified-rail__queue-dot is-${priorityClassName}`} aria-hidden="true" />
      <span className="workspace-unified-rail__queue-copy">
        <strong>{item.title}</strong>
        <span>{item.meta}</span>
      </span>
      <span className="workspace-unified-rail__queue-side">
        {item.priorityLabel ? (
          <span className={`workspace-unified-rail__priority is-${priorityClassName}`}>
            {item.priorityLabel}
          </span>
        ) : null}
        <span className="workspace-unified-rail__queue-chevron" aria-hidden="true">›</span>
      </span>
    </>
  );
  const className = [
    'workspace-unified-rail__queue-item',
    item.isActive ? 'is-active' : '',
  ].filter(Boolean).join(' ');

  if (item.action.kind === 'link') {
    return (
      <Link
        href={item.action.href}
        prefetch={item.action.prefetch ?? false}
        className={className}
        aria-current={item.isActive ? 'true' : undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={item.action.onClick}
      disabled={item.action.disabled}
      aria-pressed={item.isActive || undefined}
    >
      {content}
    </button>
  );
}

function renderSkeleton() {
  return Array.from({ length: 3 }).map((_, index) => (
    <WorkspaceRightRailPanel key={`workspace-unified-rail-skeleton-${index}`}>
      <div className="stack-sm" aria-hidden="true">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-10 w-20" />
        <div className="skeleton h-5 w-11/12" />
        <div className="skeleton h-5 w-4/5" />
        <div className="skeleton h-24 w-full" />
      </div>
    </WorkspaceRightRailPanel>
  ));
}

export function WorkspaceUnifiedRail({
  model,
  isLoading = false,
  className,
}: Props) {
  if (!model && isLoading) {
    return renderSkeleton();
  }

  if (!model) {
    return null;
  }

  const showsDecisionChart =
    model.decisionPanel.visualization === 'donut' && model.decisionPanel.metrics.length > 0;
  const showsMetricGrid =
    model.decisionPanel.layout === 'metricGrid' && model.decisionPanel.metrics.length > 0;
  const decisionHeading = model.decisionPanel.contextLabel || model.decisionPanel.title;
  const primaryDecisionAction = model.decisionPanel.primaryAction
    ? renderInlineAction(
      model.decisionPanel.primaryAction,
      'app-button-primary workspace-ai-card__action workspace-unified-rail__primary',
    )
    : null;
  const secondaryDecisionAction = model.decisionPanel.secondaryAction
    ? renderInlineAction(
      model.decisionPanel.secondaryAction,
      'workspace-unified-rail__secondary',
    )
    : null;
  const decisionMetrics = model.decisionPanel.metrics.length > 0 ? (
    <dl className="workspace-unified-rail__metrics">
      {model.decisionPanel.metrics.map((item, index) => (
        <div key={item.key} className={`is-tone-${index + 1}`}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  ) : null;
  const decisionMetricGrid = showsMetricGrid ? (
    <dl className="workspace-unified-rail__metric-grid">
      {model.decisionPanel.metrics.slice(0, 4).map((item, index) => (
        <div
          key={item.key}
          className={`is-tone-${index + 1} is-${item.tone ?? 'neutral'}`}
        >
          <span className="workspace-unified-rail__metric-icon">
            {renderMetricIcon(item.icon)}
          </span>
          <dd>{item.value}</dd>
          <dt>{item.label}</dt>
        </div>
      ))}
    </dl>
  ) : null;
  const decisionPanelClassName = [
    'workspace-unified-rail__panel',
    'workspace-unified-rail__panel--decision',
    showsMetricGrid ? 'has-metric-grid' : '',
    showsDecisionChart ? 'has-visualization' : 'has-no-visualization',
  ].filter(Boolean).join(' ');

  return (
    <div className={['workspace-unified-rail', className ?? ''].filter(Boolean).join(' ')}>
      <WorkspaceRightRailPanel className={decisionPanelClassName}>
        {showsMetricGrid ? (
          <>
            <span className="workspace-unified-rail__eyebrow">{model.decisionPanel.eyebrow}</span>
            {decisionMetricGrid}
            <div className="workspace-unified-rail__metric-grid-actions">
              {primaryDecisionAction}
              {secondaryDecisionAction}
            </div>
          </>
        ) : (
          <div className="workspace-unified-rail__decision-head">
            <div className="workspace-unified-rail__decision-copy">
              <span className="workspace-unified-rail__eyebrow">{model.decisionPanel.eyebrow}</span>
              <div className="workspace-unified-rail__decision-main">
                <strong className="workspace-unified-rail__value">{model.decisionPanel.value}</strong>
                {decisionHeading ? (
                  <h3 className="workspace-unified-rail__title">{decisionHeading}</h3>
                ) : null}
              </div>
              {primaryDecisionAction}
            </div>
            <div className="workspace-unified-rail__decision-side">
              <div className="workspace-unified-rail__decision-side-body">
                {showsDecisionChart ? (
                  <div className="workspace-unified-rail__decision-visual">
                    <div
                      className="workspace-unified-rail__chart"
                      style={buildDecisionChartStyle(model.decisionPanel.metrics)}
                      aria-hidden="true"
                    >
                      <span className="workspace-unified-rail__chart-core" />
                    </div>
                  </div>
                ) : null}
                {decisionMetrics}
              </div>
              {secondaryDecisionAction}
            </div>
          </div>
        )}
      </WorkspaceRightRailPanel>

      <WorkspaceRightRailPanel className="workspace-unified-rail__panel">
        <span className="workspace-unified-rail__eyebrow">{model.actionQueue.eyebrow}</span>
        <h3 className="workspace-unified-rail__section-title">{model.actionQueue.title}</h3>
        {model.actionQueue.items.length > 0 ? (
          <ul className="workspace-unified-rail__queue-list">
            {model.actionQueue.items.map((item) => (
              <li key={item.id}>{renderQueueItem(item)}</li>
            ))}
          </ul>
        ) : (
          <p className="workspace-unified-rail__empty">{model.actionQueue.emptyText}</p>
        )}
        {model.actionQueue.footerAction
          ? renderInlineAction(
            model.actionQueue.footerAction,
            'workspace-unified-rail__footer-link',
          )
          : null}
      </WorkspaceRightRailPanel>

      <WorkspaceRightRailPanel className="workspace-unified-rail__panel">
        <span className="workspace-unified-rail__eyebrow">{model.recommendations.eyebrow}</span>
        <h3 className="workspace-unified-rail__section-title">{model.recommendations.title}</h3>
        {model.recommendations.items.length > 0 ? (
          <ul className="workspace-unified-rail__recommendations-list">
            {model.recommendations.items.map((item) => (
              <li
                key={item.id}
                className={`workspace-unified-rail__recommendation is-${item.tone ?? 'neutral'}`}
              >
                <div className="workspace-unified-rail__recommendation-copy">
                  <div className="workspace-unified-rail__recommendation-head">
                    <span className={`workspace-unified-rail__recommendation-icon is-${item.tone ?? 'neutral'}`} aria-hidden="true" />
                    <strong>{item.title}</strong>
                  </div>
                  <span>{item.description}</span>
                </div>
                {item.metric != null ? (
                  <span className="workspace-unified-rail__recommendation-metric">{item.metric}</span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="workspace-unified-rail__empty">
            {model.recommendations.emptyText ?? model.actionQueue.emptyText}
          </p>
        )}
        {model.recommendations.footerAction
          ? renderInlineAction(
            model.recommendations.footerAction,
            'workspace-unified-rail__footer-link',
          )
          : null}
      </WorkspaceRightRailPanel>
    </div>
  );
}
