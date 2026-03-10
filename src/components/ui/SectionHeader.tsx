'use client';

import * as React from 'react';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  titleId?: string;
  subtitleId?: string;
  titleAs?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  actions?: React.ReactNode;
  hideHeading?: boolean;
};

export function SectionHeader({
  title,
  subtitle,
  titleId,
  subtitleId,
  titleAs = 'p',
  className,
  actions,
  hideHeading = false,
}: SectionHeaderProps) {
  return (
    <header className={`panel-header ${className ?? ''}`.trim()}>
      {!hideHeading ? (
        <div className="section-heading">
          {React.createElement(
            titleAs,
            {
              id: titleId,
              className: 'section-title',
            },
            title,
          )}
          {subtitle ? (
            <p id={subtitleId} className="section-subtitle">
              {subtitle}
            </p>
          ) : null}
        </div>
      ) : null}
      {actions ?? null}
    </header>
  );
}
