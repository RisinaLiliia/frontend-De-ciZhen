'use client';

import * as React from 'react';
import type { ConsentChoice, ConsentDraft, ConsentRecord } from './types';
import {
  createConsentRecord,
  getDefaultConsentChoice,
  readConsentRecord,
  saveConsentRecord,
} from './storage';
import { setRuntimeConsentChoice } from './runtime';

type ConsentContextValue = {
  ready: boolean;
  decisionMade: boolean;
  choice: ConsentChoice;
  draft: ConsentDraft;
  isPreferencesOpen: boolean;
  openPreferences: () => void;
  closePreferences: () => void;
  setDraft: (next: ConsentDraft) => void;
  acceptAll: () => void;
  rejectOptional: () => void;
  savePreferences: () => void;
};

const ConsentContext = React.createContext<ConsentContextValue | undefined>(undefined);

function toDraft(choice: ConsentChoice): ConsentDraft {
  return {
    analytics: choice.analytics,
    marketing: choice.marketing,
  };
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = React.useState(false);
  const [record, setRecord] = React.useState<ConsentRecord | null>(null);
  const [choice, setChoice] = React.useState<ConsentChoice>(getDefaultConsentChoice());
  const [draft, setDraft] = React.useState<ConsentDraft>(toDraft(getDefaultConsentChoice()));
  const [isPreferencesOpen, setPreferencesOpen] = React.useState(false);

  React.useEffect(() => {
    const stored = readConsentRecord();
    if (stored) {
      setRecord(stored);
      setChoice(stored.choice);
      setDraft(toDraft(stored.choice));
      setRuntimeConsentChoice(stored.choice);
    } else {
      setRuntimeConsentChoice(getDefaultConsentChoice());
    }
    setReady(true);
  }, []);

  const commit = React.useCallback((next: ConsentRecord) => {
    setRecord(next);
    setChoice(next.choice);
    setDraft(toDraft(next.choice));
    setRuntimeConsentChoice(next.choice);
    saveConsentRecord(next);
  }, []);

  const openPreferences = React.useCallback(() => {
    setDraft(toDraft(choice));
    setPreferencesOpen(true);
  }, [choice]);

  const closePreferences = React.useCallback(() => {
    setPreferencesOpen(false);
  }, []);

  const acceptAll = React.useCallback(() => {
    const next = createConsentRecord({ analytics: true, marketing: true }, 'banner');
    commit(next);
    setPreferencesOpen(false);
  }, [commit]);

  const rejectOptional = React.useCallback(() => {
    const next = createConsentRecord({ analytics: false, marketing: false }, 'banner');
    commit(next);
    setPreferencesOpen(false);
  }, [commit]);

  const savePreferencesChoice = React.useCallback(() => {
    const next = createConsentRecord(draft, 'preferences');
    if (record) {
      next.decidedAt = record.decidedAt;
    }
    commit(next);
    setPreferencesOpen(false);
  }, [commit, draft, record]);

  const value = React.useMemo<ConsentContextValue>(
    () => ({
      ready,
      decisionMade: Boolean(record),
      choice,
      draft,
      isPreferencesOpen,
      openPreferences,
      closePreferences,
      setDraft,
      acceptAll,
      rejectOptional,
      savePreferences: savePreferencesChoice,
    }),
    [
      ready,
      record,
      choice,
      draft,
      isPreferencesOpen,
      openPreferences,
      closePreferences,
      acceptAll,
      rejectOptional,
      savePreferencesChoice,
    ],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const ctx = React.useContext(ConsentContext);
  if (!ctx) {
    throw new Error('useConsent must be used within ConsentProvider');
  }
  return ctx;
}
