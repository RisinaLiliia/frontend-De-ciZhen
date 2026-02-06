// src/app/client/offers/page.tsx
'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { Button } from '@/components/ui/Button';
import { listMyClientResponses, acceptResponse } from '@/lib/api/responses';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import Link from 'next/link';

const Star = ({ filled }: { filled: boolean }) => (
  <span
    className={filled ? 'text-[var(--c-primary)]' : 'text-[var(--c-border)]'}
    aria-hidden
  >
    ★
  </span>
);

export default function ClientOffersPage() {
  const t = useT();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['client-offers'],
    queryFn: () => listMyClientResponses(),
  });

  const onAccept = async (id: string) => {
    try {
      await acceptResponse(id);
      toast.success(t(I18N_KEYS.offers.accepted));
      await qc.invalidateQueries({ queryKey: ['client-offers'] });
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    }
  };

  const renderStars = (rating?: number | null) => {
    const safe = Math.max(0, Math.min(5, Math.round(rating ?? 0)));
    return (
      <span className="flex items-center gap-1 text-sm">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Star key={idx} filled={idx < safe} />
        ))}
        <span className="ml-1 text-[var(--c-text-muted)]">{rating?.toFixed(1) ?? '—'}</span>
      </span>
    );
  };

  return (
    <PageShell right={<AuthActions />} withSpacer={false}>
      <section className="text-center stack-sm">
        <h1 className="typo-h2">{t(I18N_KEYS.client.offersTitle)}</h1>
        <p className="typo-muted">{t(I18N_KEYS.client.offersSubtitle)}</p>
      </section>

        {isLoading ? <p className="typo-muted">{t(I18N_KEYS.common.refreshing)}</p> : null}

      <div className="stack-md">
        {(data ?? []).length === 0 && !isLoading ? (
          <p className="typo-muted text-center">{t(I18N_KEYS.client.offersEmpty)}</p>
        ) : null}

          {(data ?? []).map((item) => {
            const displayName = item.providerDisplayName || t(I18N_KEYS.offers.unnamed);
            const initials = displayName
              .split(' ')
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase())
              .join('');
            return (
              <div key={item.id} className="card stack-md">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 shrink-0 rounded-full border border-[var(--c-border)] bg-[var(--c-panel)] flex items-center justify-center text-sm font-semibold text-[var(--c-text-muted)]">
                    {initials || '•'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold">{displayName}</p>
                        <div className="mt-1">{renderStars(item.providerRatingAvg)}</div>
                      </div>
                      <span className="badge capitalize">{item.status}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="badge">
                        {t(I18N_KEYS.offers.jobs)}: {item.providerCompletedJobs ?? '—'}
                      </span>
                      {item.providerBasePrice ? (
                        <span className="badge">€ {item.providerBasePrice}</span>
                      ) : null}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Link href={`/providers/${item.providerUserId}`} className="badge">
                        {t(I18N_KEYS.offers.profileCta)}
                      </Link>
                      <Link href={`/chat/${item.id}`} className="badge">
                        {t(I18N_KEYS.offers.chatCta)}
                      </Link>
                      <Button type="button" onClick={() => onAccept(item.id)}>
                        {t(I18N_KEYS.offers.acceptCta)}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </PageShell>
  );
}
