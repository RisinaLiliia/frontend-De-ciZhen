import { buildApiUrl } from '@/lib/api/url';

async function fetchLegal(path: '/legal/privacy' | '/legal/cookies'): Promise<string> {
  const res = await fetch(buildApiUrl(path), {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to load legal document: ${res.status}`);
  }
  return res.text();
}

export function getPrivacyPolicy() {
  return fetchLegal('/legal/privacy');
}

export function getCookieNotice() {
  return fetchLegal('/legal/cookies');
}
