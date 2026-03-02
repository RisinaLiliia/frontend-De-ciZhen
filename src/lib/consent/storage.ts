import {
  CONSENT_COOKIE_MAX_AGE_SECONDS,
  CONSENT_COOKIE_NAME,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
} from './constants';
import type { ConsentChoice, ConsentRecord, ConsentSource } from './types';

const DEFAULT_CHOICE: ConsentChoice = {
  necessary: true,
  analytics: false,
  marketing: false,
};

function isBrowser() {
  return typeof window !== 'undefined';
}

function isValidRecord(value: unknown): value is ConsentRecord {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<ConsentRecord>;
  if (record.version !== CONSENT_VERSION) return false;
  if (typeof record.decidedAt !== 'string' || typeof record.updatedAt !== 'string') return false;
  if (record.source !== 'banner' && record.source !== 'preferences') return false;
  if (!record.choice || typeof record.choice !== 'object') return false;
  if (record.choice.necessary !== true) return false;
  if (typeof record.choice.analytics !== 'boolean') return false;
  if (typeof record.choice.marketing !== 'boolean') return false;
  return true;
}

function writeConsentCookie(choice: ConsentChoice) {
  if (!isBrowser()) return;
  const value = choice.analytics ? 'analytics' : 'necessary';
  document.cookie = `${CONSENT_COOKIE_NAME}=${value}; Path=/; Max-Age=${CONSENT_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function createConsentRecord(
  draft: Pick<ConsentChoice, 'analytics' | 'marketing'>,
  source: ConsentSource,
  now = new Date(),
): ConsentRecord {
  const iso = now.toISOString();
  return {
    version: CONSENT_VERSION,
    decidedAt: iso,
    updatedAt: iso,
    source,
    choice: {
      ...DEFAULT_CHOICE,
      analytics: Boolean(draft.analytics),
      marketing: Boolean(draft.marketing),
    },
  };
}

export function readConsentRecord(): ConsentRecord | null {
  if (!isBrowser()) return null;

  const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidRecord(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveConsentRecord(record: ConsentRecord) {
  if (!isBrowser()) return;
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  writeConsentCookie(record.choice);
}

export function clearConsentRecord() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(CONSENT_STORAGE_KEY);
  document.cookie = `${CONSENT_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function getDefaultConsentChoice(): ConsentChoice {
  return DEFAULT_CHOICE;
}
