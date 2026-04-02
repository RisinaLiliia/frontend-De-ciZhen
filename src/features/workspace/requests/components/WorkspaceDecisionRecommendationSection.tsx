'use client';

import * as React from 'react';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';

type WorkspaceDecisionRecommendationSectionProps = {
  badgeLabel: string;
  badgeTone: BadgeVariant;
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

  return (
    <section className={rootClassName}>
      <div className="workspace-statistics-insights__content">
        <div className="workspace-statistics-insights__eyebrow">
          <Badge variant={badgeTone} tone="soft" size="sm" className="workspace-statistics-insights__chip">
            {badgeLabel}
          </Badge>
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
