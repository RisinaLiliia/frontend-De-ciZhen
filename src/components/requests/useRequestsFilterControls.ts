'use client';

import * as React from 'react';

export function useRequestsFilterControls() {
  const [isMobileControlsOpen, setIsMobileControlsOpen] = React.useState(false);
  const sortControlRef = React.useRef<HTMLDivElement | null>(null);

  const toggleMobileControls = React.useCallback(() => {
    setIsMobileControlsOpen((prev) => !prev);
  }, []);

  const openSortControl = React.useCallback(() => {
    setIsMobileControlsOpen(true);
    requestAnimationFrame(() => {
      sortControlRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }, []);

  return {
    isMobileControlsOpen,
    sortControlRef,
    toggleMobileControls,
    openSortControl,
  };
}
