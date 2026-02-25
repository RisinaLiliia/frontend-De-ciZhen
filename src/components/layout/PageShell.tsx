// src/components/layout/PageShell.tsx
'use client';

import { TopBar } from '@/components/layout/TopBar';
import { BackButton } from '@/components/layout/BackButton';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils/cn';

type Props = {
  title?: string;
  right?: React.ReactNode;
  showLanguageToggle?: boolean;
  showThemeToggle?: boolean;
  showBack?: boolean;
  backHref?: string;
  forceBackHref?: boolean;
  withSpacer?: boolean;
  mainClassName?: string;
  children: React.ReactNode;
};

export function PageShell({
  title,
  right,
  showLanguageToggle = true,
  showThemeToggle = true,
  showBack = true,
  backHref,
  forceBackHref = false,
  withSpacer = false,
  mainClassName,
  children,
}: Props) {
  const headerRight =
    showLanguageToggle || showThemeToggle || right ? (
      <div className="page-shell__topbar-actions flex items-center gap-2">
        {showLanguageToggle ? <LanguageToggle /> : null}
        {showThemeToggle ? <ThemeToggle /> : null}
        {right}
      </div>
    ) : null;

  return (
    <div className="min-h-dvh">
      <TopBar title={title} right={headerRight} />

      <main
        className={cn(
          'container-mobile min-h-[calc(100dvh-56px)] py-8 flex flex-col',
          mainClassName,
        )}
      >
        {showBack ? (
          <div className="flex items-center">
            <BackButton fallbackHref={backHref} forceFallback={forceBackHref} />
          </div>
        ) : null}
        {children}
        {withSpacer ? <div className="flex-1" /> : null}
      </main>
    </div>
  );
}
