import type { APIRoute } from 'astro';
import type { PublicPage } from '../pages.ts';
import { pageMarkdown } from '../pages.ts';
import { homepageLinkHeader } from './seo.ts';
import { MARKDOWN_CONTENT_TYPE, VARY_ACCEPT } from './negotiate.ts';
import { API_RESPONSE_HEADERS, EXPOSED_AGENT_HEADERS, jsonHeaders } from './http.ts';

export function markdownPageRoute(page: PublicPage): APIRoute {
  return async () =>
    new Response(pageMarkdown(page), {
      headers: {
        'Content-Type': MARKDOWN_CONTENT_TYPE,
        Vary: VARY_ACCEPT,
        Link: homepageLinkHeader(),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': EXPOSED_AGENT_HEADERS,
        ...API_RESPONSE_HEADERS,
      },
    });
}

export function jsonPageRoute(body: () => unknown): APIRoute {
  return async () => new Response(JSON.stringify(body()), { headers: jsonHeaders() });
}
