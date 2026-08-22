import {
  chooseMediaType,
  MARKDOWN_CONTENT_TYPE,
  PLAIN_CONTENT_TYPE,
  VARY_ACCEPT,
} from '../../src/lib/agent/negotiate';
import { homepageLinkHeader } from '../../src/lib/agent/seo';
import { homepageMarkdown, notAcceptableBody, notFoundMarkdown } from '../../src/lib/agent/markdown';

const MARKDOWN_PATHS = new Set(['/', '/index.html']);

interface Context {
  next: () => Promise<Response>;
}

function hasFileExtension(pathname: string): boolean {
  const filename = pathname.split('/').pop() ?? '';
  const dot = filename.lastIndexOf('.');
  return dot > 0 && dot < filename.length - 1;
}

export default async function handler(request: Request, context: Context) {
  const pathname = new URL(request.url).pathname;

  // Static files (llms.txt, sitemap.xml, robots.txt, assets) should not be
  // rewritten by content negotiation. Pass them to Netlify's static server.
  if (hasFileExtension(pathname) && !MARKDOWN_PATHS.has(pathname)) {
    return context.next();
  }

  const acceptHeader = request.headers.get('accept');
  const mediaType = chooseMediaType(acceptHeader);

  if (mediaType === null) {
    return new Response(notAcceptableBody(acceptHeader ?? ''), {
      status: 406,
      headers: {
        'Content-Type': PLAIN_CONTENT_TYPE,
        Vary: VARY_ACCEPT,
      },
    });
  }

  if (mediaType === 'text/markdown') {
    const isHome = MARKDOWN_PATHS.has(pathname);
    return new Response(isHome ? homepageMarkdown() : notFoundMarkdown(), {
      status: isHome ? 200 : 404,
      headers: {
        'Content-Type': MARKDOWN_CONTENT_TYPE,
        Vary: VARY_ACCEPT,
        Link: homepageLinkHeader(),
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
