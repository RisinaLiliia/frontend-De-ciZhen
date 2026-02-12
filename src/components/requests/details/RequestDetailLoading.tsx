// src/components/requests/details/RequestDetailLoading.tsx
import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';

export function RequestDetailLoading() {
  return (
    <PageShell right={<AuthActions />} showBack mainClassName="py-6">
      <div className="request-detail request-detail--loading">
        <section className="panel request-detail__panel">
          <div className="skeleton h-7 w-3/4" />
          <div className="skeleton h-4 w-1/2" />
          <div className="request-detail__gallery">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`photo-${index}`} className="request-detail__photo skeleton" />
            ))}
          </div>
          <div className="skeleton h-20 w-full" />
        </section>
        <aside className="panel request-detail__panel request-detail__aside">
          <div className="skeleton h-6 w-2/3" />
          <div className="skeleton h-10 w-full" />
          <div className="skeleton h-10 w-full" />
        </aside>
      </div>
    </PageShell>
  );
}
