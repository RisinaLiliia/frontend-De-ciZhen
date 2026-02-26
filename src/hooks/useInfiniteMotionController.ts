'use client';

import * as React from 'react';

const INFINITE_MOTION_SELECTORS = [
  '.skeleton',
  '.badge-live',
  '.stat-live',
  '.radar-dot',
  '.hero-experiment',
  '.hero-experiment__preview-badge',
  '.hero-experiment__trust li',
  '.hero-shot',
  '.home-trust-live-panel__hero-shot',
  '.home-proof-panel',
  '.home-howitworks-panel',
  '.home-nearby-panel',
  '.home-stats-panel',
  '.top-providers-panel',
  '.requests-filters',
  '.requests-select-icon--city',
  '.order-card-link.is-active',
  '.provider-status-dot',
  '.nearby-dot',
  '.nearby-dot-item',
] as const;

function getMotionTargets(root: ParentNode): HTMLElement[] {
  const targets = new Set<HTMLElement>();
  for (const selector of INFINITE_MOTION_SELECTORS) {
    root.querySelectorAll<HTMLElement>(selector).forEach((el) => targets.add(el));
  }
  return Array.from(targets);
}

export function useInfiniteMotionController() {
  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const intersectionState = new Map<HTMLElement, boolean>();
    const observedTargets = new Set<HTMLElement>();

    const applyPausedState = () => {
      const isReduced = media.matches;
      const isHidden = document.visibilityState !== 'visible';
      observedTargets.forEach((el) => {
        const isIntersecting = intersectionState.get(el) ?? true;
        const shouldPause = isReduced || isHidden || !isIntersecting;
        el.dataset.motionPaused = shouldPause ? 'true' : 'false';
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          intersectionState.set(entry.target as HTMLElement, entry.isIntersecting);
        });
        applyPausedState();
      },
      { root: null, threshold: 0.01 },
    );

    const syncTargets = () => {
      const currentTargets = new Set(getMotionTargets(document));

      observedTargets.forEach((target) => {
        if (!currentTargets.has(target)) {
          observer.unobserve(target);
          observedTargets.delete(target);
          intersectionState.delete(target);
          delete target.dataset.motionPaused;
        }
      });

      currentTargets.forEach((target) => {
        if (!observedTargets.has(target)) {
          observedTargets.add(target);
          intersectionState.set(target, true);
          observer.observe(target);
        }
      });

      applyPausedState();
    };

    let rafId: number | null = null;
    const scheduleSync = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        syncTargets();
      });
    };

    const mutationObserver = new MutationObserver(scheduleSync);
    mutationObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

    const handleVisibilityChange = () => applyPausedState();
    const handleMotionPreferenceChange = () => applyPausedState();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', handleMotionPreferenceChange);
    } else {
      media.addListener(handleMotionPreferenceChange);
    }

    syncTargets();

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      mutationObserver.disconnect();
      observer.disconnect();
      observedTargets.forEach((target) => {
        delete target.dataset.motionPaused;
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (typeof media.removeEventListener === 'function') {
        media.removeEventListener('change', handleMotionPreferenceChange);
      } else {
        media.removeListener(handleMotionPreferenceChange);
      }
    };
  }, []);
}
