'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useT } from '@/lib/i18n/useT';
import type { PersonalNavItem } from '@/components/layout/PersonalNavSection';
import { WorkspaceMobileSectionSheetCard } from '@/features/workspace/requests/WorkspaceMobileSectionSheetCard';
import { useWorkspaceMobileSectionSheet } from '@/features/workspace/requests/useWorkspaceMobileSectionSheet';
import {
  isWorkspaceMobileSheetItemActive,
  splitWorkspaceMobileSheetItems,
} from '@/features/workspace/requests/workspaceMobileSectionSheet.model';

export function WorkspaceMobileSectionSheet({
  items,
}: {
  items: PersonalNavItem[];
}) {
  const t = useT();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { open, setOpen, panelRef, closeButtonRef } = useWorkspaceMobileSectionSheet();
  const titleId = React.useId();
  const { primaryItems, secondaryItems } = React.useMemo(
    () => splitWorkspaceMobileSheetItems(items),
    [items],
  );

  const isActive = React.useCallback((item: PersonalNavItem) => {
    return isWorkspaceMobileSheetItemActive(item, pathname, searchParams);
  }, [pathname, searchParams]);

  const onSelectItem = React.useCallback((item: PersonalNavItem) => {
    item.onClick?.();
    setOpen(false);
  }, [setOpen]);

  if (!open) return null;

  return (
    <div className="workspace-mobile-nav-sheet" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button
        type="button"
        className="workspace-mobile-nav-sheet__backdrop"
        aria-label={t(I18N_KEYS.auth.closeDialog)}
        onClick={() => setOpen(false)}
      />
      <section ref={panelRef} className="workspace-mobile-nav-sheet__surface">
        <header className="workspace-mobile-nav-sheet__header">
          <div className="workspace-mobile-nav-sheet__copy">
            <h2 id={titleId} className="workspace-mobile-nav-sheet__title">{t(I18N_KEYS.auth.workspaceLabel)}</h2>
            <p className="workspace-mobile-nav-sheet__subtitle">{t(I18N_KEYS.auth.navigationLabel)}</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="workspace-mobile-nav-sheet__close"
            aria-label={t(I18N_KEYS.auth.closeDialog)}
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </header>
        <div className="workspace-mobile-nav-sheet__body">
          {primaryItems.length ? (
            <section className="workspace-mobile-nav-sheet__section">
              <div className="workspace-mobile-nav-sheet__grid">
                {primaryItems.map((item) => (
                  <WorkspaceMobileSectionSheetCard
                    key={item.key}
                    item={item}
                    active={isActive(item)}
                    onSelect={onSelectItem}
                  />
                ))}
              </div>
            </section>
          ) : null}
          {secondaryItems.length ? (
            <section className="workspace-mobile-nav-sheet__section workspace-mobile-nav-sheet__section--secondary">
              <div className="workspace-mobile-nav-sheet__grid">
                {secondaryItems.map((item) => (
                  <WorkspaceMobileSectionSheetCard
                    key={item.key}
                    item={item}
                    active={isActive(item)}
                    onSelect={onSelectItem}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </div>
  );
}
