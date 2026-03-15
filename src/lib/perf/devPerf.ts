'use client';

type PerfDetail = Record<string, unknown> | undefined;

function canProfile() {
  return (
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_DEV_PERF === '1' &&
    typeof window !== 'undefined'
  );
}

export function devPerfCanProfile() {
  return canProfile();
}

function roundMs(value: number) {
  return Math.round(value * 100) / 100;
}

export function devPerfNow() {
  if (!canProfile()) return 0;
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

export function devPerfLog(scope: string, event: string, detail?: PerfDetail) {
  if (!canProfile()) return;
  if (detail) {
    console.debug(`[perf:${scope}] ${event}`, detail);
    return;
  }
  console.debug(`[perf:${scope}] ${event}`);
}

export function devPerfDuration(
  scope: string,
  event: string,
  startedAt: number,
  detail?: PerfDetail,
) {
  if (!canProfile()) return;
  const durationMs = roundMs(devPerfNow() - startedAt);
  devPerfLog(scope, event, { durationMs, ...(detail ?? {}) });
}
