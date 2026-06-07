'use client';

import * as React from 'react';
import { BackButton } from '@/components/layout/BackButton';

type RequestsExplorerViewProps = {
  isProvidersView: boolean;
  showBack: boolean;
  backHref: string;
  providersContent: React.ReactNode;
  requestsContent: React.ReactNode;
};

export function RequestsExplorerView({
  isProvidersView,
  showBack,
  backHref,
  providersContent,
  requestsContent,
}: RequestsExplorerViewProps) {
  return (
    <section className="stack-sm">
      {showBack ? (
        <BackButton fallbackHref={backHref} />
      ) : null}
      {isProvidersView ? providersContent : requestsContent}
    </section>
  );
}
