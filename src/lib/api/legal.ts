import { buildApiUrl } from '@/lib/api/url';

export type LegalDocumentResponse = {
  content: string;
  lastModified: string | null;
};

async function fetchLegal(path: '/legal/privacy' | '/legal/cookies'): Promise<LegalDocumentResponse> {
  const res = await fetch(buildApiUrl(path), {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to load legal document: ${res.status}`);
  }
  const content = await res.text();
  const lastModified = res.headers.get('last-modified');
  return {
    content,
    lastModified,
  };
}

export function getPrivacyPolicy() {
  return fetchLegal('/legal/privacy');
}

export function getCookieNotice() {
  return fetchLegal('/legal/cookies');
}
