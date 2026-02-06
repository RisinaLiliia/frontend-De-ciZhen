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
    <PageShell right={null}>
      <section className="card stack-lg">
        <header className="text-center stack-sm">
          <h1 className="typo-h1">{title}</h1>
          {subtitle ? <p className="typo-muted">{subtitle}</p> : null}
        </header>
        {children}
      </section>
    </PageShell>
  );
}
