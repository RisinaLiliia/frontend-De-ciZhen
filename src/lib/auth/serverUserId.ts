// src/lib/auth/serverUserId.ts
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const json =
      typeof atob === 'function'
        ? atob(padded)
        : Buffer.from(padded, 'base64').toString('utf8');
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getUserIdFromRefreshToken(token: string | null | undefined): string | null {
  if (typeof token !== 'string' || token.length === 0) return null;
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  const sub = typeof payload.sub === 'string' ? payload.sub.trim() : '';
  return sub.length > 0 ? sub : null;
}
