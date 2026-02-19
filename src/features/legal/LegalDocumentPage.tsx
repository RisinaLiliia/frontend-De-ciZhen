'use client';

import * as React from 'react';
import ReactMarkdown from 'react-markdown';

import styles from './LegalDocumentPage.module.css';

import { getCookieNotice, getPrivacyPolicy } from '@/lib/api/legal';

type Props = {
  title: string;
  type: 'privacy' | 'cookies';
};

type TocItem = { id: string; label: string; level: 2 | 3 };

export function LegalDocumentPage({ title, type }: Props) {
  const [content, setContent] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = React.useState<string>('');
  const [copied, setCopied] = React.useState(false);

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
    if (!content) return [] as TocItem[];
    const lines = content.split('\n');
    const result: TocItem[] = [];
    for (const line of lines) {
      const h2 = /^##\s+(.+)$/.exec(line);
      const h3 = /^###\s+(.+)$/.exec(line);
      if (h2) result.push({ id: slugify(h2[1]), label: h2[1].trim(), level: 2 });
      if (h3) result.push({ id: slugify(h3[1]), label: h3[1].trim(), level: 3 });
    }
    return result;
  }, [content]);

  React.useEffect(() => {
    if (!toc.length) {
      setActiveSectionId('');
      return;
    }

    const headings = toc
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!headings.length) {
      setActiveSectionId('');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
          setActiveSectionId(visible.target.id);
        }
      },
      {
        root: null,
        rootMargin: '-20% 0px -64% 0px',
        threshold: [0.1, 0.4, 0.7],
      },
    );

    headings.forEach((el) => observer.observe(el));
    setActiveSectionId(headings[0]?.id ?? '');

    return () => {
      observer.disconnect();
    };
  }, [toc, content]);

  const readingMinutes = React.useMemo(() => {
    if (!content) return 0;
    const plain = content.replace(/[#*_`>\-]/g, ' ');
    const words = plain.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 220));
  }, [content]);

  const lastUpdatedLabel = React.useMemo(
    () =>
      new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date()),
    [],
  );

  const handleCopyLink = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }, []);

  return (
    <main className={`container-mobile py-8 ${styles.page}`}>
      <section className={`card ${styles.legalWrap}`}>
        <header className={styles.legalHeader}>
          <div className={styles.legalHeaderMeta}>
            <span className={styles.eyebrow}>Rechtliches</span>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>Transparenz, Datenschutz und klare Regeln für die Nutzung der Plattform.</p>
          </div>
          <div className={styles.brandBadge}>De&apos;ciZhen Legal</div>
        </header>

        <div className={styles.metaBar}>
          <span className={styles.metaPill}>Zuletzt aktualisiert: {lastUpdatedLabel}</span>
          {readingMinutes ? <span className={styles.metaPill}>Lesezeit: ~{readingMinutes} Min</span> : null}
          <div className={styles.metaActions}>
            <button type="button" className={styles.metaButton} onClick={handleCopyLink}>
              {copied ? 'Link kopiert' : 'Link kopieren'}
            </button>
            <button type="button" className={styles.metaButton} onClick={() => window.print()}>
              Drucken
            </button>
          </div>
        </div>

        {loading ? (
          <div className={styles.notice} role="status" aria-live="polite">
            Wird geladen...
          </div>
        ) : null}

        {error ? (
          <div className={styles.error} role="alert">
            {error}
          </div>
        ) : null}

        {!loading && !error ? (
          <div className={styles.legalGrid}>
            {toc.length > 0 ? (
              <aside className={styles.toc}>
                <p className={styles.tocTitle}>Inhalt</p>
                <ul className={styles.tocList}>
                  {toc.map((item) => {
                    const isActive = item.id === activeSectionId;
                    return (
                      <li key={`${item.level}-${item.id}`} className={item.level === 3 ? styles.tocSubItem : styles.tocItem}>
                        <a
                          href={`#${item.id}`}
                          className={`${styles.tocLink} ${isActive ? styles.tocLinkActive : ''}`}
                          aria-current={isActive ? 'location' : undefined}
                        >
                          {item.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </aside>
            ) : null}

            <article className={styles.markdownWrap}>
              <div className={styles.markdown}>
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 id={slugify(childrenToText(children))}>{children}</h1>,
                    h2: ({ children }) => <h2 id={slugify(childrenToText(children))}>{children}</h2>,
                    h3: ({ children }) => <h3 id={slugify(childrenToText(children))}>{children}</h3>,
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
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
