import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CONSENT_STORAGE_KEY, CONSENT_VERSION } from './constants';
import {
  clearConsentRecord,
  createConsentRecord,
  readConsentRecord,
  saveConsentRecord,
} from './storage';

type StorageMock = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

function createStorageMock(): StorageMock {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, String(value));
    },
    removeItem: (key) => {
      map.delete(key);
    },
    clear: () => {
      map.clear();
    },
  };
}

beforeEach(() => {
  const localStorage = createStorageMock();
  vi.stubGlobal('window', { localStorage });
  vi.stubGlobal('document', { cookie: '' });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('consent storage', () => {
  it('saves and reads consent record', () => {
    const record = createConsentRecord({ analytics: true, marketing: false }, 'banner', new Date('2026-03-02T12:00:00.000Z'));

    saveConsentRecord(record);

    const parsed = readConsentRecord();
    expect(parsed).toEqual(record);
  });

  it('returns null for malformed storage payload', () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ version: CONSENT_VERSION, invalid: true }));

    expect(readConsentRecord()).toBeNull();
  });

  it('clears persisted consent', () => {
    const record = createConsentRecord({ analytics: false, marketing: false }, 'banner');
    saveConsentRecord(record);

    clearConsentRecord();

    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBeNull();
    expect(readConsentRecord()).toBeNull();
  });
});
