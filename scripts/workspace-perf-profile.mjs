import { chromium } from '@playwright/test';

const baseUrl = process.env.WORKSPACE_PROFILE_BASE_URL || 'http://localhost:3000';
const workspaceUrl = `${baseUrl}/workspace?section=requests`;
const providerUrl = `${baseUrl}/providers/69a433d8b31d3257ae5df91d`;

const events = [];
const perfLogs = [];

function normalize(url) {
  try {
    const u = new URL(url);
    if (u.pathname.startsWith('/_next/')) return u.pathname;
    if (u.pathname.startsWith('/api/')) {
      return `${u.pathname}${u.search ? `?${u.searchParams.toString()}` : ''}`;
    }
    return u.pathname;
  } catch {
    return url;
  }
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

page.on('console', (msg) => {
  const text = msg.text();
  if (text.includes('[perf:')) {
    perfLogs.push(text);
  }
});

page.on('requestfinished', async (request) => {
  const response = await request.response();
  const timing = request.timing();
  const duration =
    timing && Number.isFinite(timing.responseEnd) && Number.isFinite(timing.startTime)
      ? Math.max(0, timing.responseEnd - timing.startTime)
      : null;
  events.push({
    type: 'finished',
    method: request.method(),
    key: normalize(request.url()),
    status: response?.status() ?? null,
    resourceType: request.resourceType(),
    duration,
  });
});

page.on('requestfailed', (request) => {
  events.push({
    type: 'failed',
    method: request.method(),
    key: normalize(request.url()),
    status: 'FAILED',
    resourceType: request.resourceType(),
    duration: null,
    errorText: request.failure()?.errorText ?? 'unknown',
  });
});

await page.goto(workspaceUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
await page.waitForTimeout(3_500);
await page.goto(providerUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
await page.waitForTimeout(3_000);

const grouped = new Map();
for (const item of events) {
  const key = `${item.method} ${item.key}`;
  if (!grouped.has(key)) {
    grouped.set(key, {
      key,
      count: 0,
      failed: 0,
      statuses: new Set(),
      durations: [],
      resourceTypes: new Set(),
    });
  }
  const row = grouped.get(key);
  row.count += 1;
  if (item.status === 'FAILED') {
    row.failed += 1;
  } else if (typeof item.status === 'number') {
    row.statuses.add(item.status);
  }
  if (typeof item.duration === 'number' && Number.isFinite(item.duration)) {
    row.durations.push(item.duration);
  }
  row.resourceTypes.add(item.resourceType);
}

const rows = [...grouped.values()]
  .map((row) => {
    const avgDurationMs =
      row.durations.length > 0
        ? Math.round(row.durations.reduce((sum, value) => sum + value, 0) / row.durations.length)
        : null;
    return {
      key: row.key,
      count: row.count,
      failed: row.failed,
      statuses: [...row.statuses].sort((a, b) => a - b),
      avgDurationMs,
      resourceTypes: [...row.resourceTypes].sort(),
    };
  })
  .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));

const apiRows = rows.filter((row) => row.key.includes(' /api/'));
const duplicateRows = rows.filter(
  (row) => row.count > 1 && !row.key.includes('/_next/static/') && !row.key.includes('/__nextjs_font/'),
);

const summary = {
  baseUrl,
  totalRequestsObserved: events.length,
  uniqueRequestKeys: rows.length,
  failedRequests: events.filter((event) => event.type === 'failed').length,
  apiRequestTotalCount: apiRows.reduce((sum, row) => sum + row.count, 0),
  apiUniqueRequestKeys: apiRows.length,
  apiRequests: apiRows,
  nonStaticDuplicates: duplicateRows,
  reactPerfLogs: perfLogs,
  topRequests: rows.slice(0, 30),
};

console.log(JSON.stringify(summary, null, 2));

await browser.close();
