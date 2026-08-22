import type { APIRoute } from 'astro';
import { llmsTxt } from '../lib/agent/llms';
import { MARKDOWN_CONTENT_TYPE } from '../lib/agent/negotiate';

export const GET: APIRoute = async () => {
  return new Response(llmsTxt(), {
    headers: { 'Content-Type': MARKDOWN_CONTENT_TYPE },
  });
};
