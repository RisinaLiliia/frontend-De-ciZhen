'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';

import type { Locale } from '@/lib/i18n/t';

export function WorkspaceInlineStateCard({
  locale,
  title,
  body,
  tone,
}: {
  locale: Locale;
  title: string;
  body: string;
  tone: 'empty' | 'error' | 'info';
}) {
  const icon = tone === 'error'
    ? '!'
    : tone === 'empty'
      ? '0'
      : 'i';

  return (
    <div className={`my-request-inline-state my-request-inline-state--${tone}`.trim()} role={tone === 'error' ? 'alert' : 'status'}>
      <span className="my-request-inline-state__icon" aria-hidden="true">{icon}</span>
      <div className="my-request-inline-state__copy">
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
      <span className="my-request-inline-state__meta">
        {locale === 'de' ? 'Inline' : 'Inline'}
      </span>
    </div>
  );
}

export function WorkspaceCompactModalPortal({
  locale,
  ariaLabel,
  onClose,
  children,
}: {
  locale: Locale;
  ariaLabel: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (!isMounted) return undefined;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [isMounted]);

  if (!isMounted) return null;

  return createPortal((
    <div className="dc-modal my-request-dialog" role="dialog" aria-modal="true" aria-label={ariaLabel}>
      <button
        type="button"
        className="dc-modal__backdrop"
        onClick={onClose}
        aria-label={locale === 'de' ? 'Dialog schließen' : 'Close dialog'}
      />
      <div className="dc-modal__panel dc-modal__panel--compact my-request-dialog__panel">
        {children}
      </div>
    </div>
  ), document.body);
}
