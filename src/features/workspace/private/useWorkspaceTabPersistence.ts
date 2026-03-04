'use client';

import * as React from 'react';

import {
  REQUESTS_TAB_STORAGE_KEY,
  type WorkspaceTab,
} from '@/features/workspace/requests';

type Args = {
  isWorkspaceAuthed: boolean;
  isWorkspacePublicSection: boolean;
  activeWorkspaceTab: WorkspaceTab;
};

export function useWorkspaceTabPersistence({
  isWorkspaceAuthed,
  isWorkspacePublicSection,
  activeWorkspaceTab,
}: Args) {
  React.useEffect(() => {
    if (typeof window === 'undefined' || !isWorkspaceAuthed) return;
    if (isWorkspacePublicSection) return;
    window.localStorage.setItem(REQUESTS_TAB_STORAGE_KEY, activeWorkspaceTab);
  }, [activeWorkspaceTab, isWorkspaceAuthed, isWorkspacePublicSection]);
}
