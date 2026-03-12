import 'server-only';
import { z } from 'zod';

const optionalTrimmed = z
  .string()
  .optional()
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  });

const optionalHttpUrl = optionalTrimmed.refine(
  (value) => !value || /^https?:\/\//.test(value),
  'must be an absolute http(s) URL',
);

const optionalWsOrHttpUrl = optionalTrimmed.refine(
  (value) => !value || /^(wss?|https?):\/\//.test(value),
  'must be an absolute ws(s) or http(s) URL',
);

const optionalPathOrUrl = optionalTrimmed.refine((value) => {
  if (!value) return true;
  if (value.startsWith('/')) return true;
  try {
    const url = new URL(value);
    return Boolean(url.protocol && url.host);
  } catch {
    return false;
  }
}, 'must be a relative path or an absolute URL');

const serverEnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    API_BASE_URL: optionalHttpUrl,
    NEXT_PUBLIC_API_BASE: optionalHttpUrl,
    NEXT_PUBLIC_PRESENCE_WS_BASE: optionalWsOrHttpUrl,
    NEXT_PUBLIC_PRIVACY_POLICY_URL: optionalPathOrUrl,
    NEXT_PUBLIC_COOKIE_NOTICE_URL: optionalPathOrUrl,
    NEXT_PUBLIC_ENABLE_APPLE_AUTH: z.enum(['true', 'false']).optional(),
    NEXT_PUBLIC_DEMO: z.enum(['true', 'false']).optional(),
    NEXT_PUBLIC_HERO_ANIMATION_MODE: z.enum(['subtle', 'showcase']).optional(),
    NEXT_PUBLIC_ANALYTICS_ENABLED: z.enum(['true', 'false']).optional(),
    NEXT_PUBLIC_WORKSPACE_STATS_SHOW_KPI: z.enum(['true', 'false']).optional(),
    NEXT_PUBLIC_WORKSPACE_STATS_BFF: z.enum(['true', 'false']).optional(),
    NEXT_IMAGE_UNOPTIMIZED: z.enum(['true', 'false']).optional(),
    NEXT_IMAGE_OPTIMIZE_DEV: z.enum(['true', 'false']).optional(),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === 'production' && !env.API_BASE_URL && !env.NEXT_PUBLIC_API_BASE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['API_BASE_URL'],
        message: 'for production, set API_BASE_URL or NEXT_PUBLIC_API_BASE',
      });
    }
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | null = null;

function formatIssuePath(path: PropertyKey[]) {
  if (path.length === 0) return 'env';
  return path
    .map((segment) => (typeof segment === 'symbol' ? segment.toString() : String(segment)))
    .join('.');
}

function parseServerEnv() {
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `- ${formatIssuePath(issue.path)}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${details}`);
  }
  return parsed.data;
}

export function getServerEnv() {
  if (cachedEnv) return cachedEnv;
  cachedEnv = parseServerEnv();
  return cachedEnv;
}

export function assertServerEnv() {
  void getServerEnv();
}
