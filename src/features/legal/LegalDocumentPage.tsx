'use client';

import * as React from 'react';

import { getCookieNotice, getPrivacyPolicy } from '@/lib/api/legal';

type Props = {
  title: string;
  type: 'privacy' | 'cookies';
};

export function LegalDocumentPage({ title, type }: Props) {
  const [content, setContent] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isActive = true;

    const load = type === 'privacy' ? getPrivacyPolicy : getCookieNotice;

    setLoading(true);
    setError(null);

    load()
      .then((text) => {
        if (isActive) setContent(text);
      })
      .catch(() => {
        if (isActive) setError('Dokument konnte nicht geladen werden.');
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [type]);

  return (
    <main className="container-mobile py-8">
      <section className="card stack-sm">
        <h1 className="typo-h2">{title}</h1>
        {loading ? <p className="typo-muted">Wird geladen...</p> : null}
        {error ? <p className="auth-form-error">{error}</p> : null}
        {!loading && !error ? (
          <pre className="text-sm whitespace-pre-wrap break-words leading-6">{content}</pre>
        ) : null}
      </section>
    </main>
  );
}
