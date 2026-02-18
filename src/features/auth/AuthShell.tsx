// src/features/auth/AuthShell.tsx
'use client';
import { PageShell } from '@/components/layout/PageShell';

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <PageShell right={null} showBack={false} mainClassName="auth-shell-main">
      <div className="auth-shell">
        <section className="card stack-lg auth-shell__dialog">
          <header className="text-center stack-sm auth-shell__header">
            <h1 className="typo-h1 auth-shell__title">{title}</h1>
            {subtitle ? <p className="typo-muted auth-shell__subtitle">{subtitle}</p> : null}
          </header>
          {children}
        </section>
      </div>
    </PageShell>
  );
}
