'use client';

import Link from 'next/link';

export type WorkspaceInsightsPanelItem = {
  key: string;
  level?: 'info' | 'trend' | 'warning';
  kind?: 'demand' | 'opportunity' | 'performance' | 'growth' | 'risk' | 'promotion' | 'other';
  badgeLabel: string;
  badgeTone: 'success' | 'info' | 'warning' | 'danger';
  title?: string;
  text: string;
  evidence?: string;
  metrics?: string[];
  actionLabel?: string;
  actionHref?: string;
  debugText?: string;
};

type WorkspaceInsightsPanelProps = {
  title?: string;
  subtitle?: string;
  emptyLabel: string;
  generatedLabel: string;
  assistantAvatarLabel: string;
  assistantName: string;
  assistantRole: string;
  featuredLabel?: string;
  items: WorkspaceInsightsPanelItem[];
  className?: string;
  panelRef?: React.Ref<HTMLElement>;
  style?: React.CSSProperties;
};

function renderInsightAction(item: WorkspaceInsightsPanelItem) {
  if (!item.actionLabel) return null;

  if (item.actionHref) {
    return (
      <Link href={item.actionHref} prefetch={false} className="workspace-statistics-insights__action">
        {item.actionLabel}
        <span aria-hidden="true">→</span>
      </Link>
    );
  }

  return (
    <span className="workspace-statistics-insights__action">
      {item.actionLabel}
      <span aria-hidden="true">→</span>
    </span>
  );
}

function buildInsightClassName(item: WorkspaceInsightsPanelItem, featured = false) {
  return [
    'stat-card',
    'stat-link',
    'workspace-statistics-insights__item',
    featured ? 'is-featured' : '',
    item.level ? `is-${item.level}` : '',
    item.kind ? `is-${item.kind}` : '',
  ].filter(Boolean).join(' ');
}

export function WorkspaceInsightsPanel({
  title,
  subtitle,
  emptyLabel,
  generatedLabel,
  assistantAvatarLabel,
  assistantName,
  assistantRole,
  featuredLabel,
  items,
  className,
  panelRef,
  style,
}: WorkspaceInsightsPanelProps) {
  const featuredItem = items[0];
  const secondaryItems = items.slice(1);
  const hasHeading = Boolean(title?.trim() || subtitle?.trim());
  const panelLabel = title?.trim() || assistantRole;
  const rootClassName = [
    hasHeading ? 'panel' : 'workspace-statistics-ki',
    'workspace-insights-panel',
    hasHeading ? '' : 'workspace-insights-panel--compact-head',
    className ?? '',
  ].filter(Boolean).join(' ');

  return (
    <section
      ref={panelRef}
      style={style}
      className={rootClassName}
    >
      {hasHeading ? (
        <header
          className={[
            'section-heading',
            'workspace-statistics__tile-header',
            'workspace-statistics-insights__header',
          ].filter(Boolean).join(' ')}
        >
          <span className="workspace-statistics-insights__heading">
            {title?.trim() ? <p className="section-title">{title}</p> : null}
            {subtitle?.trim() ? <p className="section-subtitle">{subtitle}</p> : null}
          </span>
          <div className="workspace-statistics-insights__ki">
            <span className="workspace-statistics-ki__stamp">{generatedLabel}</span>
            <div className="workspace-statistics-ki__head">
              <span className="workspace-statistics-ki__avatar" aria-hidden="true">
                {assistantAvatarLabel}
              </span>
              <span className="workspace-statistics-ki__copy">
                <strong className="workspace-statistics-ki__name">{assistantName}</strong>
                <span className="workspace-statistics-ki__role">{assistantRole}</span>
              </span>
            </div>
          </div>
        </header>
      ) : (
        <>
          <span className="workspace-statistics-ki__stamp">{generatedLabel}</span>
          <div className="workspace-statistics-ki__head">
            <span className="workspace-statistics-ki__avatar" aria-hidden="true">
              {assistantAvatarLabel}
            </span>
            <span className="workspace-statistics-ki__copy">
              <strong className="workspace-statistics-ki__name">{assistantName}</strong>
              <span className="workspace-statistics-ki__role">{assistantRole}</span>
            </span>
          </div>
        </>
      )}
      {items.length === 0 ? (
        <p className="workspace-statistics__empty">{emptyLabel}</p>
      ) : (
        <div className="workspace-statistics-insights" aria-label={panelLabel}>
          {featuredItem ? (
            <article className={buildInsightClassName(featuredItem, true)}>
              <span className="workspace-statistics-insights__content">
                <span className="workspace-statistics-insights__eyebrow">
                  <span className={`status-badge status-badge--${featuredItem.badgeTone} workspace-statistics-insights__chip`}>
                    {featuredItem.badgeLabel}
                  </span>
                  {featuredLabel ? (
                    <span className="workspace-statistics-insights__featured-label">{featuredLabel}</span>
                  ) : null}
                </span>
                {featuredItem.title ? (
                  <strong className="workspace-statistics-insights__title">{featuredItem.title}</strong>
                ) : null}
                <span className="workspace-statistics-insights__text">{featuredItem.text}</span>
                {featuredItem.metrics && featuredItem.metrics.length > 0 ? (
                  <span className="workspace-statistics-insights__metrics">
                    {featuredItem.metrics.map((token) => (
                      <span key={`${featuredItem.key}-${token}`} className="workspace-statistics-insights__metric">
                        {token}
                      </span>
                    ))}
                  </span>
                ) : null}
                {featuredItem.evidence ? (
                  <span className="workspace-statistics-insights__evidence">{featuredItem.evidence}</span>
                ) : null}
                {renderInsightAction(featuredItem)}
                {featuredItem.debugText ? (
                  <span className="workspace-statistics-insights__debug">{featuredItem.debugText}</span>
                ) : null}
              </span>
            </article>
          ) : null}
          {secondaryItems.length > 0 ? (
            <ul className="workspace-statistics-insights__secondary requests-list" aria-label={panelLabel}>
              {secondaryItems.map((item) => (
                <li key={item.key} className={buildInsightClassName(item)}>
                  <span className="workspace-statistics-insights__content">
                    <span className="workspace-statistics-insights__eyebrow">
                      <span className={`status-badge status-badge--${item.badgeTone} workspace-statistics-insights__chip`}>
                        {item.badgeLabel}
                      </span>
                    </span>
                    {item.title ? (
                      <strong className="workspace-statistics-insights__title">{item.title}</strong>
                    ) : null}
                    <span className="workspace-statistics-insights__text">{item.text}</span>
                    {item.evidence ? (
                      <span className="workspace-statistics-insights__evidence">{item.evidence}</span>
                    ) : null}
                    {renderInsightAction(item)}
                    {item.debugText ? (
                      <span className="workspace-statistics-insights__debug">{item.debugText}</span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </section>
  );
}
