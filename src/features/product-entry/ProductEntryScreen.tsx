'use client';

import Link from 'next/link';

import { WorkspaceBadge } from '@/features/workspace/shared/WorkspaceBadge';
import { WorkspaceRightRailStack, WorkspaceUnifiedRail } from '@/features/workspace/shared';
import { WorkspaceTopBar } from '@/features/workspace/shell';

import { productEntryFlowItems, productEntryRailModel } from './productEntry.model';
import { ConsentManageFooter } from '@/components/legal/ConsentManageFooter';

export function ProductEntryScreen() {
  return (
    <main className="product-entry product-entry--sidebar-hidden">
      <WorkspaceTopBar showBrand />

      <section className="product-entry__screen" aria-labelledby="product-entry-title">
        <div className="product-entry__content">
          <p className="workspace-unified-rail__eyebrow product-entry__eyebrow">
            Marketplace · CRM · Decision Engine · ein Workspace
          </p>

          <h1 id="product-entry-title" className="product-entry__title">
            Verwalte lokale Dienstleistungen von Anfrage bis Entscheidung.
          </h1>

          <p className="product-entry__lead">
            Finde Anbieter, verwalte Angebote, kommuniziere zentral und treffe bessere
            Entscheidungen mit KI-Unterstützung.
          </p>

          <ul className="product-entry__flow" aria-label="Produktablauf">
            {productEntryFlowItems.map((item, index) => (
              <li key={item.label} className="product-entry__flow-item">
                <WorkspaceBadge
                  variant={item.badgeVariant}
                  className={`product-entry__flow-badge is-${item.tone}`}
                >
                  {item.label}
                </WorkspaceBadge>

                {index < productEntryFlowItems.length - 1 ? (
                  <span className="product-entry__flow-arrow" aria-hidden="true">
                    →
                  </span>
                ) : null}
              </li>
            ))}
          </ul>

          <div className="product-entry__actions">
            <Link href="/workspace" className="app-button-primary product-entry__primary-action">
              Workspace ansehen
            </Link>

            <Link href="/workspace?demo=90s" className="product-entry__video-action">
              <span className="product-entry__play-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M9 7.5v9l7-4.5-7-4.5Z" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </span>
              <span>Produkt in 90 Sek. ansehen</span>
            </Link>
          </div>

          <div className="product-entry__footer">
            <ConsentManageFooter />
          </div>
        </div>

        <aside className="product-entry__rail" aria-label="Workspace Vorschau">
          <WorkspaceRightRailStack>
            <WorkspaceUnifiedRail model={productEntryRailModel} />
          </WorkspaceRightRailStack>
        </aside>
      </section>
    </main>
  );
}
