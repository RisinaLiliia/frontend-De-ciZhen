export function parsePageParam(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return null;
  return parsed;
}

export function paginateItems<T>(items: T[], page: number, pageSize: number): {
  totalPages: number;
  safePage: number;
  startIndex: number;
  visibleItems: T[];
} {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(totalPages, Math.max(1, page));
  const startIndex = (safePage - 1) * pageSize;
  const visibleItems = items.slice(startIndex, startIndex + pageSize);
  return {
    totalPages,
    safePage,
    startIndex,
    visibleItems,
  };
}
