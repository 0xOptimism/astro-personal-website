import { SITE_EMAIL, SITE_NAME, SITE_ORIGIN } from '../site.ts';
import { MACHINE_PATHS, absoluteUrl } from './routes.ts';

export const API_VERSION = '1';
export const API_VERSION_HEADER = 'Yannis-API-Version';

export const RATE_LIMIT_POLICY_NAME = 'public';
export const RATE_LIMIT_QUOTA = 60;
export const RATE_LIMIT_WINDOW_SECONDS = 60;
export const RATE_LIMIT_REMAINING = 59;

export const RATE_LIMIT_HEADERS = {
  'RateLimit-Policy': `"${RATE_LIMIT_POLICY_NAME}";q=${RATE_LIMIT_QUOTA};w=${RATE_LIMIT_WINDOW_SECONDS}`,
  RateLimit: `"${RATE_LIMIT_POLICY_NAME}";r=${RATE_LIMIT_REMAINING};t=${RATE_LIMIT_WINDOW_SECONDS}`,
  'RateLimit-Limit': String(RATE_LIMIT_QUOTA),
  'RateLimit-Remaining': String(RATE_LIMIT_REMAINING),
  'RateLimit-Reset': String(RATE_LIMIT_WINDOW_SECONDS),
} as const;

export const API_RESPONSE_HEADERS = {
  [API_VERSION_HEADER]: API_VERSION,
  ...RATE_LIMIT_HEADERS,
} as const;

export const EXPOSED_AGENT_HEADERS = [
  API_VERSION_HEADER,
  'RateLimit',
  'RateLimit-Policy',
  'RateLimit-Limit',
  'RateLimit-Remaining',
  'RateLimit-Reset',
  'Retry-After',
  'Sunset',
].join(', ');

export interface ProblemDetailsInput {
  status: number;
  title: string;
  detail: string;
  code: string;
  hint: string;
  instance: string;
}

export interface ProblemDetails extends ProblemDetailsInput {
  type: string;
}

function problemTypeId(code: string): string {
  return code.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
}

export function problemDetails(input: ProblemDetailsInput): ProblemDetails {
  const typeId = problemTypeId(input.code);
  return {
    type: absoluteUrl(`/developers/errors#${typeId}`),
    title: input.title,
    status: input.status,
    detail: input.detail,
    instance: input.instance,
    code: input.code,
    hint: input.hint,
  };
}

export function jsonHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'public, max-age=3600',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Expose-Headers': EXPOSED_AGENT_HEADERS,
    ...API_RESPONSE_HEADERS,
    ...extra,
  };
}

export function problemHeaders(status: number, extra: Record<string, string> = {}): Record<string, string> {
  return {
    ...jsonHeaders({
      'Content-Type': 'application/problem+json; charset=utf-8',
      'Cache-Control': 'no-store',
    }),
    ...(status === 429 ? { 'Retry-After': String(RATE_LIMIT_WINDOW_SECONDS) } : {}),
    ...extra,
  };
}

export function problemResponse(input: ProblemDetailsInput, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(problemDetails(input)), {
    status: input.status,
    headers: problemHeaders(input.status, extraHeaders),
  });
}

export function apiStatusPayload() {
  return {
    status: 'ok',
    name: `${SITE_NAME} developer resources`,
    origin: SITE_ORIGIN,
    apiVersion: API_VERSION,
    contact: SITE_EMAIL,
    resources: {
      openapi: absoluteUrl(MACHINE_PATHS.openapi),
      homepageMarkdown: absoluteUrl(MACHINE_PATHS.homepageMarkdown),
      llms: absoluteUrl(MACHINE_PATHS.llms),
      mcp: absoluteUrl(MACHINE_PATHS.mcp),
      errors: absoluteUrl('/developers/errors'),
      versioning: absoluteUrl('/developers/versioning'),
      rateLimits: absoluteUrl('/developers/rate-limits'),
    },
    rateLimit: {
      policy: RATE_LIMIT_POLICY_NAME,
      quota: RATE_LIMIT_QUOTA,
      windowSeconds: RATE_LIMIT_WINDOW_SECONDS,
      headers: ['RateLimit-Policy', 'RateLimit', 'RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
    },
    deprecation: {
      policy: 'Public API versions remain available for at least 90 days after a documented Sunset date.',
      currentVersion: API_VERSION,
      deprecated: false,
    },
  };
}
