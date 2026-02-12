// src/components/requests/details/RequestDetailError.tsx
import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';

type RequestDetailErrorProps = {
  message: string;
};

export function RequestDetailError({ message }: RequestDetailErrorProps) {
  return (
    <PageShell right={<AuthActions />} showBack mainClassName="py-6">
      <section className="panel text-center">
        <p className="typo-muted">{message}</p>
      </section>
    </PageShell>
  );
}
