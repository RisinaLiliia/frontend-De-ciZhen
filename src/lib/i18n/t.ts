// src/lib/i18n/t.ts
import { de } from "./de";

type Dictionary = typeof de;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function t(path: string): string {
  const parts = path.split(".");
  let cur: unknown = de as Dictionary;

  for (const p of parts) {
    if (!isRecord(cur)) {
      return path;
    }
    cur = cur[p];
  }

  return typeof cur === "string" ? cur : path;
}
