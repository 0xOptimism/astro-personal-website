import type { APIRoute } from 'astro';
import { PLAIN_CONTENT_TYPE } from '../lib/agent/negotiate';
import { robotsTxt } from '../lib/agent/seo';

export const GET: APIRoute = async () => {
  return new Response(robotsTxt(), {
    headers: { 'Content-Type': PLAIN_CONTENT_TYPE },
  });
};
