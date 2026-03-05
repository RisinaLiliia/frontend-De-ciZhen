import * as React from 'react';

import { ProviderCard, type ProviderCardItem } from '@/components/providers/ProviderCard';
import { MoreDotsLink } from '@/components/ui/MoreDotsLink';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';

type Translate = (key: I18nKey) => string;

type ProviderSimilarSectionProps = {
  t: Translate;
  title: string;
  hint?: string;
  cards: ProviderCardItem[];
};

export function ProviderSimilarSection({ t, title, hint, cards }: ProviderSimilarSectionProps) {
  return (
    <div className="request-detail__section request-detail__similar">
      <h3 className="request-detail__section-title">{title}</h3>
      {hint ? <p className="request-detail__similar-note">{hint}</p> : null}
      {cards.length === 0 ? (
        <p className="request-detail__similar-note">{t(I18N_KEYS.requestsPage.emptyProvidersFilteredHint)}</p>
      ) : (
        <>
          <div className="provider-list">
            {cards.map((item) => (
              <ProviderCard key={item.id} provider={item} className="provider-card--similar-mobile-minimal" />
            ))}
          </div>
          <div className="request-detail__similar-footer">
            <MoreDotsLink href="/workspace?section=providers" label={t(I18N_KEYS.requestDetails.showAll)} />
          </div>
        </>
      )}
    </div>
  );
}
