// src/app/client/contracts/page.tsx
'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Field } from '@/components/ui/Field';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { listMyContracts, confirmContract, cancelContract, completeContract } from '@/lib/api/contracts';
import type { ContractDto } from '@/lib/api/dto/contracts';
import { WorkspaceContentState } from '@/components/ui/WorkspaceContentState';
import { getStatusBadgeClass } from '@/lib/statusBadge';

type FormState = {
  startAt: string;
  durationMin: string;
  note: string;
};

const emptyForm = (): FormState => ({ startAt: '', durationMin: '60', note: '' });

export default function ClientContractsPage() {
  const t = useT();
  const qc = useQueryClient();
  const [forms, setForms] = React.useState<Record<string, FormState>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['client-contracts'],
    queryFn: () => listMyContracts({ role: 'client' }),
  });

  const getForm = (id: string) => forms[id] ?? emptyForm();
  const setForm = (id: string, next: FormState) => setForms((prev) => ({ ...prev, [id]: next }));

  const onConfirm = async (item: ContractDto) => {
    const form = getForm(item.id);
    if (!form.startAt) {
      toast.error(t(I18N_KEYS.common.loadError));
      return;
    }

    try {
      const startAtIso = new Date(form.startAt).toISOString();
      await confirmContract(item.id, {
        startAt: startAtIso,
        durationMin: Number(form.durationMin || 60),
        note: form.note || undefined,
      });
      toast.success(t(I18N_KEYS.contracts.confirmed));
      await qc.invalidateQueries({ queryKey: ['client-contracts'] });
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    }
  };

  const onCancel = async (item: ContractDto) => {
    try {
      await cancelContract(item.id);
      toast.success(t(I18N_KEYS.contracts.cancelled));
      await qc.invalidateQueries({ queryKey: ['client-contracts'] });
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    }
  };

  const onComplete = async (item: ContractDto) => {
    try {
      await completeContract(item.id);
      toast.success(t(I18N_KEYS.contracts.completed));
      await qc.invalidateQueries({ queryKey: ['client-contracts'] });
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    }
  };

  return (
    <PageShell right={<AuthActions />} withSpacer={false}>
      <section className="text-center stack-sm">
        <h1 className="typo-h2">{t(I18N_KEYS.client.contractsTitle)}</h1>
        <p className="typo-muted">{t(I18N_KEYS.client.contractsSubtitle)}</p>
      </section>

      <div className="stack-md">
        <WorkspaceContentState
          isLoading={isLoading}
          isEmpty={(data ?? []).length === 0}
          emptyTitle={t(I18N_KEYS.client.contractsEmpty)}
          emptyHint={t(I18N_KEYS.client.contractsSubtitle)}
          emptyCtaLabel={t(I18N_KEYS.requestsPage.navMyOffers)}
          emptyCtaHref="/requests?tab=my-offers"
        >
          {(data ?? []).map((item) => {
            const form = getForm(item.id);
            return (
              <div key={item.id} className="card stack-md workspace-list-item">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{t(I18N_KEYS.contracts.title)}</p>
                    <p className="typo-small">{item.requestId}</p>
                  </div>
                  <span className={`${getStatusBadgeClass(item.status)} capitalize`}>{item.status}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="badge">
                    {t(I18N_KEYS.contracts.priceLabel)}: {item.priceAmount ? `€ ${item.priceAmount}` : '—'}
                  </span>
                </div>

                {item.status === 'pending' ? (
                  <div className="stack-sm">
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="stack-xs">
                        <label className="typo-small">{t(I18N_KEYS.contracts.startAtLabel)}</label>
                        <Field>
                          <Input
                            type="datetime-local"
                            value={form.startAt}
                            onChange={(e) => setForm(item.id, { ...form, startAt: e.target.value })}
                          />
                        </Field>
                      </div>
                      <div className="stack-xs">
                        <label className="typo-small">{t(I18N_KEYS.contracts.durationLabel)}</label>
                        <Field>
                          <Input
                            type="number"
                            min={15}
                            value={form.durationMin}
                            onChange={(e) => setForm(item.id, { ...form, durationMin: e.target.value })}
                          />
                        </Field>
                      </div>
                      <div className="stack-xs">
                        <label className="typo-small">{t(I18N_KEYS.contracts.noteLabel)}</label>
                        <Field>
                          <Input
                            value={form.note}
                            onChange={(e) => setForm(item.id, { ...form, note: e.target.value })}
                          />
                        </Field>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" onClick={() => onConfirm(item)}>
                        {t(I18N_KEYS.contracts.confirmCta)}
                      </Button>
                      <Button type="button" className="btn-ghost" onClick={() => onCancel(item)}>
                        {t(I18N_KEYS.contracts.cancelCta)}
                      </Button>
                    </div>
                  </div>
                ) : null}

                {item.status === 'confirmed' ? (
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" onClick={() => onComplete(item)}>
                      {t(I18N_KEYS.contracts.completeCta)}
                    </Button>
                    <Button type="button" className="btn-ghost" onClick={() => onCancel(item)}>
                      {t(I18N_KEYS.contracts.cancelCta)}
                    </Button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </WorkspaceContentState>
      </div>
    </PageShell>
  );
}
