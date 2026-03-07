// src/components/layout/PageShell.tsx
'use client';

import * as React from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { BackButton } from '@/components/layout/BackButton';
import { WorkspacePrimaryNavDesktop, WorkspacePrimaryNavMobile } from '@/components/layout/WorkspacePrimaryNav';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils/cn';
import { useInfiniteMotionController } from '@/hooks/useInfiniteMotionController';
import { useAuthStatus } from '@/hooks/useAuthSnapshot';

type Props = {
  title?: string;
  right?: React.ReactNode;
  showLanguageToggle?: boolean;
  showThemeToggle?: boolean;
  showWorkspaceNav?: boolean;
  showBack?: boolean;
  hideBackOnMobile?: boolean;
  backHref?: string;
  forceBackHref?: boolean;
  withSpacer?: boolean;
  topbarOverlay?: boolean;
  mainClassName?: string;
  children: React.ReactNode;
};

export function PageShell({
  title,
  right,
  showLanguageToggle = true,
  showThemeToggle = true,
  showWorkspaceNav = true,
  showBack = true,
  hideBackOnMobile = false,
  backHref,
  forceBackHref = false,
  withSpacer = false,
  topbarOverlay = false,
  mainClassName,
  children,
}: Props) {
  useInfiniteMotionController();
  const authStatus = useAuthStatus();
  const [isTopbarElevated, setTopbarElevated] = React.useState(false);
  const isTopbarElevatedRef = React.useRef(false);
  const isOverlayBackRow = topbarOverlay && showBack;

  React.useEffect(() => {
    let rafId: number | null = null;
    const updateTopbarElevation = () => {
      const next = window.scrollY > 8;
      if (next === isTopbarElevatedRef.current) return;
      isTopbarElevatedRef.current = next;
      setTopbarElevated(next);
    };
    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        updateTopbarElevation();
      });
    };

    updateTopbarElevation();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const hasWorkspaceNav = showWorkspaceNav;
  const canShowTopbarToggles = authStatus === 'unauthenticated';
  const isLanguageToggleVisible = showLanguageToggle && canShowTopbarToggles;
  const isThemeToggleVisible = showThemeToggle && canShowTopbarToggles;

  const headerRight =
    isLanguageToggleVisible || isThemeToggleVisible || right ? (
      <div className="page-shell__topbar-actions flex items-center gap-2">
        {isLanguageToggleVisible ? <LanguageToggle /> : null}
        {isThemeToggleVisible ? <ThemeToggle /> : null}
        {right}
      </div>
    ) : null;

  const shellMainStyle = React.useMemo<React.CSSProperties>(
    () => ({
      paddingTop: topbarOverlay ? '0px' : 'calc(var(--space-8) + var(--shell-topbar-height) + var(--shell-topbar-offset, 0px))',
    }),
    [topbarOverlay],
  );

  return (
    <div className={cn('min-h-dvh page-shell motion-reduce-transition', hasWorkspaceNav ? 'page-shell--with-mobile-nav' : null)}>
      <TopBar
        title={title}
        center={hasWorkspaceNav ? <WorkspacePrimaryNavDesktop /> : null}
        right={headerRight}
        elevated={isTopbarElevated}
      />

      <main
        style={shellMainStyle}
        className={cn(
          'container-mobile min-h-[calc(100dvh-var(--shell-topbar-height)-var(--shell-topbar-offset,0px))] pt-0 pb-8 flex flex-col',
          hasWorkspaceNav ? 'page-shell__main--with-mobile-nav' : null,
          topbarOverlay ? 'page-shell__main--topbar-overlay' : null,
          isOverlayBackRow ? 'page-shell__main--overlay-with-back' : null,
          mainClassName,
        )}
      >
        {showBack ? (
          <div
            className={cn(
              'page-shell__back-row flex items-center',
              isOverlayBackRow ? 'page-shell__back-row--overlay' : null,
              hideBackOnMobile ? 'page-shell__back-row--mobile-hidden' : null,
            )}
          >
            <BackButton fallbackHref={backHref} forceFallback={forceBackHref} />
          </div>
        ) : null}
        {children}
        {withSpacer ? <div className="flex-1" /> : null}
      </main>

      {hasWorkspaceNav ? <WorkspacePrimaryNavMobile /> : null}
    </div>
  );
}
