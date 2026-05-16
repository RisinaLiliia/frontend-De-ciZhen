'use client';

import Link from 'next/link';

import { WorkspaceSharedContextControls } from '@/features/workspace/shell/WorkspaceSharedContextControls';
import {
  buildSharedContextControlsProps,
  useWorkspaceSharedContext,
} from '@/features/workspace/shell/useWorkspaceSharedContext';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { useT } from '@/lib/i18n/useT';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import type { WorkspaceTab } from '@/features/workspace/requests';

type Translator = (key: I18nKey) => string;

export function WorkspaceModeHeader({
  t,
  locale,
  activePublicSection,
  activeWorkspaceTab,
  preferredRequestsRole = null,
}: {
  t: Translator;
  locale: Locale;
  activePublicSection: PublicWorkspaceSection | null;
  activeWorkspaceTab: WorkspaceTab;
  preferredRequestsRole?: 'customer' | 'provider' | null;
}) {
  const model = useWorkspaceSharedContext({
    t,
    locale,
    activePublicSection,
    activeWorkspaceTab,
    preferredRequestsRole,
  });
  const sharedContextControlsProps = buildSharedContextControlsProps({ model, t, locale });

  return (
    <section className="workspace-environment">
      <div className="workspace-environment__hero">
        <div className="workspace-environment__copy">
          <span className="workspace-environment__eyebrow">{model.copy.eyebrow}</span>
          <div className="workspace-environment__heading">
            <h1 className="workspace-environment__title">{model.title}</h1>
            <p className="workspace-environment__description">{model.description}</p>
          </div>
        </div>
        <div className="workspace-environment__shell-hint">{model.copy.shellHint}</div>
      </div>

      {model.activeMode === 'overview' ? (
        <nav className="workspace-mode-nav" aria-label={t(I18N_KEYS.workspace.modeNavAriaLabel)}>
          {model.modeItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              prefetch={false}
              className={`workspace-mode-nav__item${item.isActive ? ' is-active' : ''}`.trim()}
              data-mode-key={item.key}
              aria-current={item.isActive ? 'page' : undefined}
            >
              <span className="workspace-mode-nav__icon" aria-hidden="true">{item.icon}</span>
              <span className="workspace-mode-nav__copy">
                <strong className="workspace-mode-nav__label">{item.label}</strong>
                <span className="workspace-mode-nav__description">{item.description}</span>
              </span>
            </Link>
          ))}
        </nav>
      ) : null}

      <WorkspaceSharedContextControls
        {...sharedContextControlsProps}
        surface="shell"
        className="workspace-shared-context-controls--header"
      />
    </section>
  );
}

export function WorkspaceMobileContextSection({
  locale,
  activePublicSection,
  activeWorkspaceTab,
  preferredRequestsRole = null,
}: {
  locale: Locale;
  activePublicSection: PublicWorkspaceSection | null;
  activeWorkspaceTab: WorkspaceTab;
  preferredRequestsRole?: 'customer' | 'provider' | null;
}) {
  const t = useT();
  const model = useWorkspaceSharedContext({
    t,
    locale,
    activePublicSection,
    activeWorkspaceTab,
    preferredRequestsRole,
  });
  const sharedContextControlsProps = buildSharedContextControlsProps({ model, t, locale });

  return (
    <div className="workspace-mobile-context-section">
      <WorkspaceSharedContextControls
        {...sharedContextControlsProps}
        surface="shell"
        mobileBehavior="inline"
        className="workspace-mobile-context-section__controls"
      />
    </div>
  );
}
