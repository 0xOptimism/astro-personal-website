import { SITE_ORIGIN } from '../site';

export const MACHINE_PATHS = {
  homepageMarkdown: '/index.md',
  llms: '/llms.txt',
  llmsFull: '/llms-full.txt',
  sitemap: '/sitemap.xml',
  robots: '/robots.txt',
  openapi: '/openapi.json',
  mcp: '/mcp',
  mcpServerCard: '/.well-known/mcp/server-card.json',
  mcpEndpointManifest: '/.well-known/mcp/manifest.json',
} as const;

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_ORIGIN).href;
}

export function normalizeIndexHtml(pathname: string): string {
  return pathname === '/index.html' ? '/' : pathname;
}

export function isNegotiatePassthrough(pathname: string): boolean {
  return (
    pathname === MACHINE_PATHS.mcp ||
    pathname.startsWith(`${MACHINE_PATHS.mcp}/`) ||
    pathname.startsWith('/.well-known/')
  );
}
