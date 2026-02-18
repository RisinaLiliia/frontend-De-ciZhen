'use client';

import * as React from 'react';
import ReactMarkdown from 'react-markdown';

import styles from './LegalDocumentPage.module.css';

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

  const toc = React.useMemo(() => {
    if (!content) return [] as Array<{ id: string; label: string; level: 2 | 3 }>;
    const lines = content.split('\n');
    const result: Array<{ id: string; label: string; level: 2 | 3 }> = [];
    for (const line of lines) {
      const h2 = /^##\s+(.+)$/.exec(line);
      const h3 = /^###\s+(.+)$/.exec(line);
      if (h2) result.push({ id: slugify(h2[1]), label: h2[1].trim(), level: 2 });
      if (h3) result.push({ id: slugify(h3[1]), label: h3[1].trim(), level: 3 });
    }
    return result;
  }, [content]);

  return (
    <main className="container-mobile py-8">
      <section className={`card ${styles.legalWrap}`}>
        <header className={styles.legalHeader}>
          <h1 className="typo-h2">{title}</h1>
          <p className="typo-muted">De&apos;ciZhen Legal</p>
        </header>

        {loading ? <p className="typo-muted">Wird geladen...</p> : null}
        {error ? <p className="auth-form-error">{error}</p> : null}

        {!loading && !error ? (
          <div className={styles.legalGrid}>
            {toc.length > 0 ? (
              <aside className={styles.toc}>
                <p className={styles.tocTitle}>Inhalt</p>
                <ul className={styles.tocList}>
                  {toc.map((item) => (
                    <li key={`${item.level}-${item.id}`} className={item.level === 3 ? styles.tocSubItem : styles.tocItem}>
                      <a href={`#${item.id}`} className={styles.tocLink}>
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </aside>
            ) : null}

            <article className={styles.markdown}>
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 id={slugify(childrenToText(children))}>{children}</h1>,
                  h2: ({ children }) => <h2 id={slugify(childrenToText(children))}>{children}</h2>,
                  h3: ({ children }) => <h3 id={slugify(childrenToText(children))}>{children}</h3>,
                }}
              >
                {content}
              </ReactMarkdown>
            </article>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function childrenToText(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(childrenToText).join(' ');
  if (React.isValidElement<{ children?: React.ReactNode }>(children)) {
    return childrenToText(children.props.children ?? '');
  }
  return '';
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['".,():!?[\]{}]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}
