'use client';

import * as React from 'react';

type WorkspaceDecisionRecommendationSectionProps = {
  badgeLabel: string;
  badgeTone: 'info' | 'success' | 'warning';
  tone: 'performance' | 'opportunity' | 'promotion';
  text: React.ReactNode;
  metric?: React.ReactNode;
  title?: React.ReactNode;
  featured?: boolean;
  className?: string;
};

export function WorkspaceDecisionRecommendationSection({
  badgeLabel,
  badgeTone,
  tone,
  text,
  metric,
  title,
  featured = false,
  className,
}: WorkspaceDecisionRecommendationSectionProps) {
  const rootClassName = [
    'workspace-statistics-insights__item',
    featured ? 'is-featured' : '',
    `is-${tone}`,
    className ?? '',
  ].filter(Boolean).join(' ');

  const badgeClassName = `status-badge status-badge--${badgeTone} workspace-statistics-insights__chip`;

  return (
    <section className={rootClassName}>
      <div className="workspace-statistics-insights__content">
        <div className="workspace-statistics-insights__eyebrow">
          <span className={badgeClassName}>{badgeLabel}</span>
          {metric ? (
            <span className="workspace-statistics-insights__metric">{metric}</span>
          ) : null}
        </div>
        {title ? (
          <strong className="workspace-statistics-insights__title">{title}</strong>
        ) : null}
        <div className="workspace-statistics-insights__text">{text}</div>
      </div>
    </section>
  );
}
