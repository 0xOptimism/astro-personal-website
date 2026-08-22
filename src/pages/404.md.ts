import type { APIRoute } from 'astro';
import { notFoundMarkdown } from '../lib/agent/markdown';
import { homepageLinkHeader } from '../lib/agent/seo';
import { MARKDOWN_CONTENT_TYPE, VARY_ACCEPT } from '../lib/agent/negotiate';

export const GET: APIRoute = async () => {
  return new Response(notFoundMarkdown(), {
    status: 404,
    headers: {
      'Content-Type': MARKDOWN_CONTENT_TYPE,
      Vary: VARY_ACCEPT,
      Link: homepageLinkHeader(),
    },
  });
};
