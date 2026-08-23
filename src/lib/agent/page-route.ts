import type { APIRoute } from 'astro';
import type { PublicPage } from '../pages.ts';
import { pageMarkdown } from '../pages.ts';
import { homepageLinkHeader } from './seo.ts';
import { MARKDOWN_CONTENT_TYPE, VARY_ACCEPT } from './negotiate.ts';

function jsonHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'public, max-age=3600',
    'Access-Control-Allow-Origin': '*',
  };
}

export function markdownPageRoute(page: PublicPage): APIRoute {
  return async () =>
    new Response(pageMarkdown(page), {
      headers: {
        'Content-Type': MARKDOWN_CONTENT_TYPE,
        Vary: VARY_ACCEPT,
        Link: homepageLinkHeader(),
      },
    });
}

export function jsonPageRoute(body: () => unknown): APIRoute {
  return async () => new Response(JSON.stringify(body()), { headers: jsonHeaders() });
}
