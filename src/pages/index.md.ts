import type { APIRoute } from 'astro';
import { homepageMarkdown } from '../lib/agent/markdown';
import { homepageLinkHeader } from '../lib/agent/seo';
import { MARKDOWN_CONTENT_TYPE, VARY_ACCEPT } from '../lib/agent/negotiate';

export const GET: APIRoute = async () => {
  return new Response(homepageMarkdown(), {
    headers: {
      'Content-Type': MARKDOWN_CONTENT_TYPE,
      Vary: VARY_ACCEPT,
      Link: homepageLinkHeader(),
    },
  });
};
