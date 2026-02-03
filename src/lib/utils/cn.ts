// src/lib/utils/cn.ts
export function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
