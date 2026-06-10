'use client';

import * as React from 'react';
import { BackButton } from '@/components/layout/BackButton';

type RequestsExplorerViewProps = {
  layoutVariant?: 'default' | 'workspace';
  isProvidersView: boolean;
  showBack: boolean;
  backHref: string;
  providersContent: React.ReactNode;
  requestsContent: React.ReactNode;
};

export function RequestsExplorerView({
  layoutVariant = 'default',
  isProvidersView,
  showBack,
  backHref,
  providersContent,
  requestsContent,
}: RequestsExplorerViewProps) {
  const content = (
    <>
      {showBack ? <BackButton fallbackHref={backHref} /> : null}
      {isProvidersView ? providersContent : requestsContent}
    </>
  );

  if (layoutVariant === 'workspace') {
    return <div className="workspace-explorer-shell">{content}</div>;
  }

  return <section className="stack-sm">{content}</section>;
}
