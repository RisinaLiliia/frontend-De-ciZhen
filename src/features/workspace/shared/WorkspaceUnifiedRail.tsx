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
  detail?: string | null;
  priorityTone?: 'high' | 'medium' | 'low' | 'neutral';
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

export type WorkspaceUnifiedRailModel = {
  decisionPanel: {
    eyebrow: string;
    value: string | number;
    contextLabel: string;
    title: string;
    description?: string | null;
    visualization?: WorkspaceUnifiedRailVisualization;
    metrics: Array<{
      key: string;
      label: string;
      value: string | number;
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
  const content = (
    <>
      <span className={`workspace-unified-rail__queue-dot is-${item.priorityTone ?? 'neutral'}`} aria-hidden="true" />
      <span className="workspace-unified-rail__queue-copy">
        <strong>{item.title}</strong>
        <span>{item.meta}</span>
        {item.detail ? <span>{item.detail}</span> : null}
      </span>
      <span className="workspace-unified-rail__queue-side">
        {item.priorityLabel ? (
          <span className={`workspace-unified-rail__priority is-${item.priorityTone ?? 'neutral'}`}>
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

  return (
    <div className={['workspace-unified-rail', className ?? ''].filter(Boolean).join(' ')}>
      <WorkspaceRightRailPanel className="workspace-unified-rail__panel workspace-unified-rail__panel--decision">
        <span className="workspace-unified-rail__eyebrow">{model.decisionPanel.eyebrow}</span>
        <div className="workspace-unified-rail__decision-head">
          <div className="workspace-unified-rail__decision-copy">
            <strong className="workspace-unified-rail__value">{model.decisionPanel.value}</strong>
            <h3 className="workspace-unified-rail__title">{model.decisionPanel.title}</h3>
            <p className="workspace-unified-rail__context">{model.decisionPanel.contextLabel}</p>
            {model.decisionPanel.description ? (
              <p className="workspace-unified-rail__description">{model.decisionPanel.description}</p>
            ) : null}
          </div>
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
        </div>
        {model.decisionPanel.metrics.length > 0 ? (
          <dl className="workspace-unified-rail__metrics">
            {model.decisionPanel.metrics.map((item, index) => (
              <div key={item.key} className={`is-tone-${index + 1}`}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {model.decisionPanel.primaryAction || model.decisionPanel.secondaryAction ? (
          <div className="workspace-unified-rail__actions">
            {model.decisionPanel.primaryAction
              ? renderInlineAction(
                model.decisionPanel.primaryAction,
                'app-button-primary workspace-ai-card__action workspace-unified-rail__primary',
              )
              : null}
            {model.decisionPanel.secondaryAction
              ? renderInlineAction(
                model.decisionPanel.secondaryAction,
                'workspace-unified-rail__secondary',
              )
              : null}
          </div>
        ) : null}
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
