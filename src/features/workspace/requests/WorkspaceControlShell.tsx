'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';

import { IconChevronDown } from '@/components/ui/icons/icons';
import { IconX } from '@/components/ui/icons/IconX';

type ShellMode =
  | 'desktop-expanded'
  | 'desktop-collapsed'
  | 'mobile-bar'
  | 'mobile-sheet';

type ActivePanel = 'navigation' | 'filters' | 'actions' | null;

type Breakpoint = 'desktop' | 'mobile';

type ControlShellState = {
  breakpoint: Breakpoint;
  mode: ShellMode;
  activePanel: ActivePanel;
  desktopPinned: boolean;
};

type Action =
  | { type: 'SET_BREAKPOINT'; mobile: boolean }
  | { type: 'SET_DESKTOP_COLLAPSED'; collapsed: boolean }
  | { type: 'TOGGLE_DESKTOP_COLLAPSE' }
  | { type: 'RESET_DESKTOP_PIN' }
  | { type: 'OPEN_PANEL'; panel: Exclude<ActivePanel, null> }
  | { type: 'CLOSE_PANEL' };

type WorkspaceControlShellProps = {
  label: string;
  summary: string;
  navigation: React.ReactNode;
  context?: React.ReactNode;
  aside?: React.ReactNode;
  collapseThreshold?: number;
  expandThreshold?: number;
  mobilePanelTitle?: string;
};

function reducer(state: ControlShellState, action: Action): ControlShellState {
  switch (action.type) {
    case 'SET_BREAKPOINT': {
      if (action.mobile) {
        return {
          breakpoint: 'mobile',
          mode: 'mobile-bar',
          activePanel: null,
          desktopPinned: false,
        };
      }

      return {
        breakpoint: 'desktop',
        mode: 'desktop-expanded',
        activePanel: null,
        desktopPinned: false,
      };
    }

    case 'SET_DESKTOP_COLLAPSED': {
      if (state.breakpoint !== 'desktop' || state.desktopPinned) return state;
      const nextMode = action.collapsed ? 'desktop-collapsed' : 'desktop-expanded';
      if (state.mode === nextMode) return state;
      return {
        ...state,
        mode: nextMode,
        activePanel: null,
      };
    }

    case 'TOGGLE_DESKTOP_COLLAPSE': {
      if (state.breakpoint !== 'desktop') return state;
      return {
        ...state,
        mode: state.mode === 'desktop-expanded' ? 'desktop-collapsed' : 'desktop-expanded',
        activePanel: null,
        desktopPinned: true,
      };
    }

    case 'RESET_DESKTOP_PIN': {
      if (!state.desktopPinned) return state;
      return {
        ...state,
        desktopPinned: false,
      };
    }

    case 'OPEN_PANEL': {
      if (state.breakpoint !== 'mobile') return state;
      return {
        ...state,
        mode: 'mobile-sheet',
        activePanel: action.panel,
      };
    }

    case 'CLOSE_PANEL': {
      if (state.breakpoint !== 'mobile') return state;
      return {
        ...state,
        mode: 'mobile-bar',
        activePanel: null,
      };
    }

    default:
      return state;
  }
}

function initialState(): ControlShellState {
  return {
    breakpoint: 'desktop',
    mode: 'desktop-expanded',
    activePanel: null,
    desktopPinned: false,
  };
}

export function WorkspaceControlShell({
  label,
  summary,
  navigation,
  context,
  aside,
  collapseThreshold = 80,
  expandThreshold = 24,
  mobilePanelTitle,
}: WorkspaceControlShellProps) {
  const [state, dispatch] = React.useReducer(reducer, undefined, initialState);
  const portalTarget = typeof document === 'undefined' ? null : document.body;
  const stateRef = React.useRef(state);
  const hasContext = Boolean(context);
  const hasAside = Boolean(aside);
  const mobileTitle = mobilePanelTitle ?? label;
  const isDesktopExpanded = state.mode === 'desktop-expanded';
  const isMobileSheet = state.mode === 'mobile-sheet';
  const mobilePanel = hasContext ? 'filters' : 'navigation';

  React.useEffect(() => {
    stateRef.current = state;
  }, [state]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia('(min-width: 1024px)');
    const syncBreakpoint = () => {
      dispatch({ type: 'SET_BREAKPOINT', mobile: !media.matches });
    };

    syncBreakpoint();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', syncBreakpoint);
      return () => media.removeEventListener('change', syncBreakpoint);
    }

    media.addListener(syncBreakpoint);
    return () => media.removeListener(syncBreakpoint);
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined' || state.breakpoint !== 'desktop') return;

    let rafId: number | null = null;

    const syncCollapsedState = () => {
      const current = stateRef.current;
      if (current.breakpoint !== 'desktop' || current.desktopPinned) return;

      const y = window.scrollY;
      const isCollapsed = current.mode === 'desktop-collapsed';

      if (!isCollapsed && y >= collapseThreshold) {
        dispatch({ type: 'SET_DESKTOP_COLLAPSED', collapsed: true });
      } else if (isCollapsed && y <= expandThreshold) {
        dispatch({ type: 'SET_DESKTOP_COLLAPSED', collapsed: false });
      }
    };

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        syncCollapsedState();
      });
    };

    syncCollapsedState();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [collapseThreshold, expandThreshold, state.breakpoint]);

  React.useEffect(() => {
    if (!state.desktopPinned || typeof window === 'undefined') return;

    const timeoutId = window.setTimeout(() => {
      dispatch({ type: 'RESET_DESKTOP_PIN' });
    }, 1400);

    return () => window.clearTimeout(timeoutId);
  }, [state.desktopPinned]);

  React.useEffect(() => {
    if (!isMobileSheet || typeof document === 'undefined') return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        dispatch({ type: 'CLOSE_PANEL' });
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isMobileSheet]);

  const openMobileSheet = React.useCallback(() => {
    dispatch({ type: 'OPEN_PANEL', panel: mobilePanel });
  }, [mobilePanel]);

  const closeMobileSheet = React.useCallback(() => {
    dispatch({ type: 'CLOSE_PANEL' });
  }, []);

  const toggleDesktopCollapse = React.useCallback(() => {
    dispatch({ type: 'TOGGLE_DESKTOP_COLLAPSE' });
  }, []);

  const headerActionLabel = state.breakpoint === 'desktop'
    ? (isDesktopExpanded ? 'Kontrollleiste reduzieren' : 'Kontrollleiste erweitern')
    : 'Kontrollen öffnen';

  const sheetSections =
    state.activePanel === 'filters'
      ? [context, navigation]
      : [navigation, context];

  return (
    <>
      <section
        className={`workspace-control-shell is-${state.mode}`.trim()}
        data-mode={state.mode}
      >
        <div className="workspace-control-shell__header">
          <button
            type="button"
            className="workspace-control-shell__toggle"
            aria-expanded={state.breakpoint === 'desktop' ? isDesktopExpanded : isMobileSheet}
            aria-label={headerActionLabel}
            onClick={state.breakpoint === 'desktop' ? toggleDesktopCollapse : openMobileSheet}
          >
            <span className="workspace-control-shell__toggle-icon" aria-hidden="true">
              <IconChevronDown />
            </span>
          </button>

          <div className="workspace-control-shell__header-copy">
            <span className="workspace-control-shell__label">{label}</span>
            <strong className="workspace-control-shell__summary">{summary}</strong>
          </div>

        </div>

        <div
          className="workspace-control-shell__body"
          aria-hidden={state.breakpoint === 'desktop' ? !isDesktopExpanded : true}
        >
          <div
            className={`workspace-control-shell__layout${hasContext ? ' has-context' : ''}${hasAside ? ' has-aside' : ''}`.trim()}
          >
            <div className="workspace-control-shell__main">
              <div className="workspace-control-shell__section workspace-control-shell__section--navigation">
                {navigation}
              </div>
              {context ? (
                <div className="workspace-control-shell__section workspace-control-shell__section--context">
                  {context}
                </div>
              ) : null}
            </div>
            {aside ? (
              <aside className="workspace-control-shell__aside">
                {aside}
              </aside>
            ) : null}
          </div>
        </div>
      </section>

      {isMobileSheet && portalTarget
        ? createPortal(
            <div
              className="dc-modal workspace-control-shell__sheet"
              role="dialog"
              aria-modal="true"
              aria-label={mobileTitle}
            >
              <button
                type="button"
                className="dc-modal__backdrop workspace-control-shell__sheet-backdrop"
                onClick={closeMobileSheet}
                aria-label="Kontrollen schließen"
              />
              <div className="dc-modal__panel workspace-control-shell__sheet-panel">
                <div className="workspace-control-shell__sheet-header">
                  <div className="workspace-control-shell__sheet-handle" aria-hidden="true" />
                  <div className="workspace-control-shell__sheet-copy">
                    <span className="workspace-control-shell__sheet-label">{mobileTitle}</span>
                    <strong className="workspace-control-shell__sheet-summary">{summary}</strong>
                  </div>
                  <button
                    type="button"
                    className="workspace-control-shell__sheet-close"
                    aria-label="Kontrollen schließen"
                    onClick={closeMobileSheet}
                  >
                    <IconX />
                  </button>
                </div>

                <div className="workspace-control-shell__sheet-body">
                  {sheetSections.filter(Boolean).map((section, index) => (
                    <div
                      key={`workspace-control-section-${index}`}
                      className="workspace-control-shell__sheet-section"
                    >
                      {section}
                    </div>
                  ))}
                </div>
              </div>
            </div>,
            portalTarget,
          )
        : null}
    </>
  );
}
