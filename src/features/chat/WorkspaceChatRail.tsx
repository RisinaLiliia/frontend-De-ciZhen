'use client';

import Link from 'next/link';

import { useI18n } from '@/lib/i18n/I18nProvider';
import { useT } from '@/lib/i18n/useT';
import {
  WorkspaceContextFocusPanel,
} from '@/features/workspace/shell';
import { workspacePanelShell } from '@/features/workspace';

function getChatRailCopy(locale: string) {
  if (locale === 'en') {
    return {
      inboxEyebrow: 'AI Inbox',
      inboxTitle: 'Keep the thread moving',
      inboxBody: 'Use the rail to review context, jump back into active requests, and decide what needs a reply first.',
      queueEyebrow: 'Quick routes',
      queueTitle: 'Open the next workspace area',
      queueLinks: [
        { href: '/workspace?section=requests&scope=my', label: 'My requests' },
        { href: '/workspace?section=stats', label: 'Analysis' },
      ],
      contextEyebrow: 'Context',
      contextTitle: 'Messages stay inside the workspace',
      contextBody: 'The conversation view now uses the same shell, controls, and right rail as the rest of the product.',
    };
  }

  return {
    inboxEyebrow: 'AI Inbox',
    inboxTitle: 'Behalte aktive Gespräche in Bewegung',
    inboxBody: 'Nutze die rechte Spalte, um Kontext zu prüfen, direkt zu laufenden Anfragen zu springen und zuerst die wichtigsten Antworten zu priorisieren.',
    queueEyebrow: 'Schnellzugriffe',
    queueTitle: 'Öffne den nächsten Workspace-Bereich',
    queueLinks: [
      { href: '/workspace?section=requests&scope=my', label: 'Meine Anfragen' },
      { href: '/workspace?section=stats', label: 'Analyse' },
    ],
    contextEyebrow: 'Kontext',
    contextTitle: 'Nachrichten bleiben im Workspace',
    contextBody: 'Die Gesprächsansicht nutzt jetzt dieselbe Shell, dieselben Controls und dieselbe rechte AI-Spalte wie der Rest des Produkts.',
  };
}

export function WorkspaceChatRail() {
  const t = useT();
  const { locale } = useI18n();
  const copy = getChatRailCopy(locale);

  return (
    <div className="workspace-context-rail">
      <section className={workspacePanelShell('workspace-context-rail__panel')}>
        <span className="workspace-environment__eyebrow">{copy.inboxEyebrow}</span>
        <h2 className="workspace-context-rail__title">{copy.inboxTitle}</h2>
        <p className="workspace-context-rail__description">{copy.inboxBody}</p>
      </section>

      <WorkspaceContextFocusPanel
        t={t}
        locale={locale}
        activePublicSection="chat"
        activeWorkspaceTab="my-requests"
      />

      <section className={workspacePanelShell('workspace-context-rail__panel')}>
        <span className="workspace-environment__eyebrow">{copy.queueEyebrow}</span>
        <h2 className="workspace-context-rail__title">{copy.queueTitle}</h2>
        <div className="stack-sm">
          {copy.queueLinks.map((item) => (
            <Link key={item.href} href={item.href} prefetch={false} className="btn-secondary">
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <section className={workspacePanelShell('workspace-context-rail__panel')}>
        <span className="workspace-environment__eyebrow">{copy.contextEyebrow}</span>
        <h2 className="workspace-context-rail__title">{copy.contextTitle}</h2>
        <p className="workspace-context-rail__description">{copy.contextBody}</p>
      </section>
    </div>
  );
}
