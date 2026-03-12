export function toPageQueryValue(page: number): string | null {
  return page > 1 ? String(page) : null;
}

export function isPageQueryInSync(params: URLSearchParams, key: string, value: string | null): boolean {
  const current = params.get(key);
  return (current ?? null) === value;
}

export function applyPageQuery(params: URLSearchParams, key: string, value: string | null): void {
  if (value) {
    params.set(key, value);
  } else {
    params.delete(key);
  }
}
