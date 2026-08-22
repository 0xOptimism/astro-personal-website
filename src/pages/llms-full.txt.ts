import type { APIRoute } from 'astro';
import { llmsFullTxt } from '../lib/agent/llms';
import { MARKDOWN_CONTENT_TYPE } from '../lib/agent/negotiate';

export const GET: APIRoute = async () => {
  return new Response(llmsFullTxt(), {
    headers: { 'Content-Type': MARKDOWN_CONTENT_TYPE },
  });
};
