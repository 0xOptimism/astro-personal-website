import type { APIRoute } from 'astro';
import { sitemapXml } from '../lib/agent/seo';

export const GET: APIRoute = async () => {
  return new Response(sitemapXml(), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
