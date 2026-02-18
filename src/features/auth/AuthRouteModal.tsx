'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  title: string;
  subtitle?: string;
  closeLabel?: string;
  children: React.ReactNode;
};

export function AuthRouteModal({ title, subtitle, closeLabel = 'Close', children }: Props) {
  const router = useRouter();

  const close = React.useCallback(() => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.replace('/');
  }, [router]);

  return (
    <div className="dc-modal auth-route-modal" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        className="dc-modal__backdrop auth-route-modal__backdrop"
        aria-label={closeLabel}
        onClick={close}
      />
      <section className="dc-modal__panel dc-modal__panel--compact auth-route-modal__panel">
        <header className="auth-route-modal__header">
          <div className="auth-route-modal__title-wrap">
            <h1 className="auth-route-modal__title">{title}</h1>
            {subtitle ? <p className="auth-route-modal__subtitle">{subtitle}</p> : null}
          </div>
          <button type="button" className="auth-route-modal__close" aria-label={closeLabel} onClick={close}>
            ×
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
