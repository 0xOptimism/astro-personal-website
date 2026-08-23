import {
  chooseMediaType,
  MARKDOWN_CONTENT_TYPE,
  PLAIN_CONTENT_TYPE,
  VARY_ACCEPT,
} from '../../src/lib/agent/negotiate.ts';
import { homepageLinkHeader } from '../../src/lib/agent/seo.ts';
import { markdownForPath, notAcceptableBody, notFoundMarkdown } from '../../src/lib/agent/markdown.ts';
import { isNegotiatePassthrough, MACHINE_PATHS, normalizeIndexHtml } from '../../src/lib/agent/routes.ts';
import { API_RESPONSE_HEADERS, EXPOSED_AGENT_HEADERS, problemResponse } from '../../src/lib/agent/http.ts';

interface Context {
  next: () => Promise<Response>;
}

function hasFileExtension(pathname: string): boolean {
  const filename = pathname.split('/').pop() ?? '';
  const dot = filename.lastIndexOf('.');
  return dot > 0 && dot < filename.length - 1;
}

export default async function handler(request: Request, context: Context) {
  const pathname = normalizeIndexHtml(new URL(request.url).pathname);

  // Static files, MCP, and well-known discovery must not be rewritten.
  if (
    isNegotiatePassthrough(pathname) ||
    pathname === MACHINE_PATHS.apiStatus ||
    (!pathname.startsWith('/api/') && hasFileExtension(pathname))
  ) {
    return context.next();
  }

  if (pathname.startsWith('/api/')) {
    return problemResponse({
      status: 404,
      title: 'API route not found',
      detail: `The requested API path ${pathname} is not published on yannis.dev.`,
      instance: pathname,
      code: 'api.not_found',
      hint: `Read ${MACHINE_PATHS.openapi} and retry a documented path such as ${MACHINE_PATHS.apiStatus}.`,
    });
  }

  const acceptHeader = request.headers.get('accept');
  const mediaType = chooseMediaType(acceptHeader);

  if (mediaType === null) {
    return new Response(notAcceptableBody(acceptHeader ?? ''), {
      status: 406,
      headers: {
        'Content-Type': PLAIN_CONTENT_TYPE,
        Vary: VARY_ACCEPT,
        'Access-Control-Expose-Headers': EXPOSED_AGENT_HEADERS,
        ...API_RESPONSE_HEADERS,
      },
    });
  }

  if (mediaType === 'text/markdown') {
    const markdown = markdownForPath(pathname);
    return new Response(markdown ?? notFoundMarkdown(), {
      status: markdown ? 200 : 404,
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

  const response = await context.next();
  const existingVary = response.headers.get('Vary') ?? '';
  const hasAccept = existingVary
    .split(',')
    .some((token) => token.trim().toLowerCase() === 'accept');
  if (!hasAccept) {
    response.headers.set('Vary', existingVary ? `${existingVary}, Accept` : 'Accept');
  }
  if (!response.headers.has('Link')) {
    response.headers.set('Link', homepageLinkHeader());
  }
  return response;
}

export const config = { path: '/*' };
