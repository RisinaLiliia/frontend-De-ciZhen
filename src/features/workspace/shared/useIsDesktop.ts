'use client';

import * as React from 'react';

export function useMediaMatch(query: string) {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, [query]);

  return matches;
}

export function useIsDesktop() {
  // Desktop breakpoint matches the workspace layout threshold.
  return useMediaMatch('(min-width: 1024px)');
}

export function useWorkspaceWideShell() {
  // Full workspace shell with persistent left navigation starts at 1180px.
  return useMediaMatch('(min-width: 1180px)');
}
