'use client';

import Link from 'next/link';

import { WorkspaceButton } from '@/features/workspace/shared';
import { DEFAULT_PRIVATE_WORKSPACE_CREATE_REQUEST_HREF } from '@/features/workspace/requests/workspaceRequestRoute.model';
import { workspacePanelShell } from '@/features/workspace/shared/workspaceSurfaceShell';
import { useI18n } from '@/lib/i18n/I18nProvider';

function getWorkspaceHelpContent(locale: string) {
  if (locale === 'en') {
    return {
      overviewTitle: 'Quick support paths',
      overviewText:
        'Use the shortest route based on what is blocking the current workflow: conversation, settings, or execution.',
      actions: [
        {
          title: 'Open messages',
          body: 'Go straight to active conversations when a request or offer already needs a reply.',
          href: '/workspace?section=chat',
          cta: 'Open messages',
        },
        {
          title: 'Open settings',
          body: 'Manage language, appearance, and privacy preferences without leaving the workspace shell.',
          href: '/workspace?section=settings',
          cta: 'Open settings',
        },
        {
          title: 'Create a request',
          body: 'Start a new workflow when the next step is execution instead of support.',
          href: DEFAULT_PRIVATE_WORKSPACE_CREATE_REQUEST_HREF,
          cta: 'Create request',
        },
      ],
      faqTitle: 'Common questions',
      faqItems: [
        {
          question: 'Where do I change theme and language?',
          answer: 'Open Einstellungen in the left sidebar. Theme, language, and privacy now live there.',
        },
        {
          question: 'Why does chat stay inside workspace?',
          answer: 'Messages are part of the same operating shell so request context, navigation, and AI rail remain visible.',
        },
        {
          question: 'Where should I start when I am unsure?',
          answer: 'Use Dashboard or Requests first. They give the cleanest entry into active work and pending decisions.',
        },
      ],
    };
  }

  return {
    overviewTitle: 'Schnelle Hilfepfade',
    overviewText:
      'Nutze den kürzesten Weg je nachdem, was den aktuellen Workflow blockiert: Gespräch, Einstellungen oder Ausführung.',
    actions: [
      {
        title: 'Nachrichten öffnen',
        body: 'Gehe direkt in aktive Gespräche, wenn eine Anfrage oder ein Angebot bereits eine Antwort braucht.',
        href: '/workspace?section=chat',
        cta: 'Nachrichten öffnen',
      },
      {
        title: 'Einstellungen öffnen',
        body: 'Verwalte Sprache, Darstellung und Datenschutz, ohne den Workspace-Shell zu verlassen.',
        href: '/workspace?section=settings',
        cta: 'Einstellungen öffnen',
      },
      {
        title: 'Anfrage erstellen',
        body: 'Starte einen neuen Ablauf, wenn der nächste Schritt eher Ausführung als Support ist.',
        href: DEFAULT_PRIVATE_WORKSPACE_CREATE_REQUEST_HREF,
        cta: 'Anfrage erstellen',
      },
    ],
    faqTitle: 'Häufige Fragen',
    faqItems: [
      {
        question: 'Wo ändere ich Theme und Sprache?',
        answer: 'Öffne Einstellungen in der linken Sidebar. Theme, Sprache und Datenschutz liegen jetzt dort.',
      },
      {
        question: 'Warum bleibt der Chat im Workspace?',
        answer: 'Nachrichten sind Teil desselben Arbeits-Shells, damit Kontext, Navigation und AI-Rail sichtbar bleiben.',
      },
      {
        question: 'Wo sollte ich anfangen, wenn ich unsicher bin?',
        answer: 'Starte mit Dashboard oder Anfragen. Dort siehst du den klarsten Einstieg in aktive Arbeit und offene Entscheidungen.',
      },
    ],
  };
}

export function WorkspaceHelpPage() {
  const { locale } = useI18n();
  const copy = getWorkspaceHelpContent(locale);

  return (
    <section className="stack-md">
      <section className={workspacePanelShell()}>
        <div className="stack-sm">
          <h2 className="typo-h3">{copy.overviewTitle}</h2>
          <p className="typo-small">{copy.overviewText}</p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {copy.actions.map((item) => (
          <section key={item.title} className={workspacePanelShell('h-full')}>
            <div className="flex h-full flex-col gap-4">
              <div className="stack-xs">
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="typo-small">{item.body}</p>
              </div>
              <div className="mt-auto">
                <Link href={item.href} className="inline-flex">
                  <WorkspaceButton variant="secondary">{item.cta}</WorkspaceButton>
                </Link>
              </div>
            </div>
          </section>
        ))}
      </div>

      <section className={workspacePanelShell()}>
        <div className="stack-md">
          <h2 className="typo-h3">{copy.faqTitle}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {copy.faqItems.map((item) => (
              <article key={item.question} className="stack-xs">
                <h3 className="text-sm font-semibold">{item.question}</h3>
                <p className="typo-small">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
