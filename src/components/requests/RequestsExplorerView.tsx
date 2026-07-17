'use client';

import * as React from 'react';
import { BackButton } from '@/components/layout/BackButton';

type RequestsExplorerViewProps = {
  layoutVariant?: 'default' | 'workspace';
  showBack: boolean;
  backHref: string;
  content: React.ReactNode;
};

export function RequestsExplorerView({
  layoutVariant = 'default',
  showBack,
  backHref,
  content,
}: RequestsExplorerViewProps) {
  const body = (
    <>
      {showBack ? (
        <BackButton fallbackHref={backHref} />
      ) : null}
      {content}
    </>
  );

  if (layoutVariant === 'workspace') {
    return <div className="workspace-explorer-shell">{body}</div>;
  }

  return (
    <section className="stack-sm">
      {body}
    </section>
  );
}
