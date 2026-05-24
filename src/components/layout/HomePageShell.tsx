import type { ReactNode } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { AuthActions } from '@/components/layout/AuthActions';
import {
  WorkspacePrimaryNavigationDesktop,
  WorkspacePrimaryNavigationMobile,
} from '@/components/layout/workspace-navigation';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function HomePageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh page-shell page-shell--with-mobile-nav motion-reduce-transition">
      <TopBar
        center={<WorkspacePrimaryNavigationDesktop />}
        right={(
          <div className="page-shell__topbar-actions flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <AuthActions />
          </div>
        )}
      />

      <main className="container-mobile min-h-[calc(100dvh-var(--shell-topbar-height)-var(--shell-topbar-offset,0px))] pt-0 pb-8 flex flex-col page-shell__main--with-mobile-nav page-shell__main--topbar-overlay home-screen">
        {children}
        <div className="flex-1" />
      </main>

      <WorkspacePrimaryNavigationMobile />
    </div>
  );
}
