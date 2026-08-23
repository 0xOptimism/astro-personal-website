import {
  SAME_AS,
  SITE_DOMAIN,
  SITE_EMAIL,
  SITE_EMPLOYER,
  SITE_JOB_TITLE,
  SITE_LOCATION,
  SITE_NAME,
  SITE_ORIGIN,
} from './site.ts';
import {
  API_VERSION,
  API_VERSION_HEADER,
  RATE_LIMIT_POLICY_NAME,
  RATE_LIMIT_QUOTA,
  RATE_LIMIT_WINDOW_SECONDS,
} from './agent/http.ts';

export interface PublicPage {
  path: string;
  title: string;
  heading: string;
  description: string;
  changefreq: 'monthly';
  priority: string;
  navLabel?: string;
  body: string;
}

export interface PageLinkPart {
  text: string;
  href?: string;
}

const MAILTO = `mailto:${SITE_EMAIL}`;
const linkedIn = SAME_AS[0];
const github = SAME_AS[1];

export const ABOUT_PAGE: PublicPage = {
  path: '/about',
  title: `About ${SITE_NAME} | ${SITE_JOB_TITLE} at ${SITE_DOMAIN}`,
  heading: `About ${SITE_NAME}`,
  description: `${SITE_NAME} grew up in Antibes and lives in ${SITE_LOCATION}.`,
  changefreq: 'monthly',
  priority: '0.8',
  navLabel: 'About',
  body: `Born in Antibes, I live in Stockholm with my family.

Ethereum is how I started writing code. In 2017 I wanted to understand it, then I wanted things to exist, and HashDrop was the first site that felt like mine. After that I kept building until the work became a job. The companies and years are on the homepage.

Product work is more interesting when the brief is still fuzzy, and when an interface has to talk to a real system behind it. Agents are useful for scoped work, and I keep the last call.

I take photographs when I can get outside. Time with my daughters is the better part of the week.

Email [${SITE_EMAIL}](${MAILTO}) if you want to talk.`,
};

export const CONTACT_PAGE: PublicPage = {
  path: '/contact',
  title: `Contact ${SITE_NAME} | ${SITE_EMAIL} | ${SITE_DOMAIN}`,
  heading: `Contact ${SITE_NAME}`,
  description: `Contact ${SITE_NAME} at ${SITE_EMAIL}. ${SITE_JOB_TITLE} in ${SITE_LOCATION}. LinkedIn and GitHub are public.`,
  changefreq: 'monthly',
  priority: '0.8',
  navLabel: 'Contact',
  body: `Email [${SITE_EMAIL}](${MAILTO}). I read that inbox myself. If you want to talk about work, this site, or something you are building, start there.

A few sentences is plenty. Say who you are and what you want, and add a link if it helps.

Recruiting is welcome when you name the role and why it looks like a fit. Cold pitches that ignore the stack or ${SITE_LOCATION} usually get nothing back.

I'm in ${SITE_LOCATION}, at ${SITE_EMPLOYER}, doing full-stack work on commerce and the tools around it. [LinkedIn](${linkedIn}) and [GitHub](${github}) are public if you want the longer trail.

I reply when the mail looks like it was written to a person. Timing depends on the week.`,
};

export const PRIVACY_PAGE: PublicPage = {
  path: '/privacy',
  title: `Privacy | ${SITE_NAME} | ${SITE_DOMAIN}`,
  heading: 'Privacy',
  description: `How ${SITE_DOMAIN} handles information.`,
  changefreq: 'monthly',
  priority: '0.6',
  body: `This is a personal site. There is no login, no checkout, and no ads. I do not sell or rent personal data.

The site is hosted on Netlify. Netlify may keep standard request logs (IP address, user agent, URL, and time) to run the service and deal with abuse. I do not use those logs to build a marketing profile.

When analytics are on, they run through Umami. It does not set advertising cookies. You can still use the site if the script fails to load. The design-skin switch, if you use it, stays in localStorage on your device and is not sent to me as an account.

If you email [${SITE_EMAIL}](${MAILTO}), I use your address and the message only to reply. [LinkedIn](${linkedIn}) and [GitHub](${github}) are separate sites with their own policies. There is no contact form that stores submissions on a server I run.

Questions about this: [${SITE_EMAIL}](${MAILTO}).`,
};

export const DEVELOPERS_PAGE: PublicPage = {
  path: '/developers',
  title: `${SITE_NAME} developer resources | ${SITE_DOMAIN}`,
  heading: `${SITE_NAME} developer resources`,
  description: `OpenAPI, markdown, and MCP endpoints for ${SITE_DOMAIN}.`,
  changefreq: 'monthly',
  priority: '0.8',
  body: `This site is a personal portfolio with a small public read API for agents. The files below are public copies of the same profile already on the homepage: work, stack, timeline, and email. They are read-only. There is nothing to authenticate and nothing to write.

OpenAPI lives at [${SITE_ORIGIN}/openapi.json](${SITE_ORIGIN}/openapi.json). A markdown version of the homepage is at [${SITE_ORIGIN}/index.md](${SITE_ORIGIN}/index.md). The short agent index is [${SITE_ORIGIN}/llms.txt](${SITE_ORIGIN}/llms.txt), and the long version is [${SITE_ORIGIN}/llms-full.txt](${SITE_ORIGIN}/llms-full.txt). The canonical Yannis MCP server card is [${SITE_ORIGIN}/.well-known/mcp.json](${SITE_ORIGIN}/.well-known/mcp.json).

There is also an MCP server at [${SITE_ORIGIN}/mcp](${SITE_ORIGIN}/mcp) if you want tools instead of pages. How to connect is on [/developers/mcp](/developers/mcp). Auth is on [/developers/auth](/developers/auth). Typed JSON errors are documented on [/developers/errors](/developers/errors), API versioning is on [/developers/versioning](/developers/versioning), and rate limits are on [/developers/rate-limits](/developers/rate-limits). The short answer on [/developers/webhooks](/developers/webhooks) is that there are none.

If something here asks you for a password, it is a mistake. Email [${SITE_EMAIL}](${MAILTO}).`,
};

export const AUTH_DOCS_PAGE: PublicPage = {
  path: '/developers/auth',
  title: `${SITE_NAME} auth | ${SITE_DOMAIN}`,
  heading: `${SITE_NAME} auth`,
  description: `Public pages on ${SITE_DOMAIN} do not require login or API keys.`,
  changefreq: 'monthly',
  priority: '0.6',
  body: `There is no login, API key, or OAuth app for this site. HTML, markdown, OpenAPI, llms.txt, and the MCP manifests are all public. You do not need a token to read them.

The MCP server at [${SITE_ORIGIN}/mcp](${SITE_ORIGIN}/mcp) is public too. Send the usual MCP headers. Do not send a bearer token. I do not issue access tokens, and I will not treat a random x-api-key as a credential.

That is on purpose. The data is a public bio, an email address, and a work history. If a later endpoint needs identity, it will be written up here first.

Questions: [${SITE_EMAIL}](${MAILTO}).`,
};

export const ERRORS_DOCS_PAGE: PublicPage = {
  path: '/developers/errors',
  title: `${SITE_NAME} JSON errors | ${SITE_DOMAIN}`,
  heading: `${SITE_NAME} JSON errors`,
  description: `RFC 9457 problem details used by the ${SITE_DOMAIN} public API.`,
  changefreq: 'monthly',
  priority: '0.6',
  body: `JSON API errors on yannis.dev use RFC 9457 problem details with Content-Type: application/problem+json. The core fields are type, title, status, detail, and instance. Yannis also returns code and hint extension fields so agents can branch on a stable machine value and show a practical recovery step without parsing prose.

Problem type URLs live on this page. The current public codes are api.not_found for unknown API routes, http.method_not_allowed when a method is not supported, http.forbidden_origin when an MCP Origin header is not http or https, http.not_acceptable when a requested media type cannot be produced, request.invalid_json when a body cannot be parsed, mcp.unsupported_protocol_version for unsupported MCP protocol headers, rate_limit.exceeded for 429 responses, and server.error for unexpected failures.

A typical response is a JSON object such as {"type":"${SITE_ORIGIN}/developers/errors#api.not_found","title":"API route not found","status":404,"detail":"The requested API path is not published on yannis.dev.","instance":"/api/example","code":"api.not_found","hint":"Read ${SITE_ORIGIN}/openapi.json and retry a documented path."}

HTML pages still return HTML for browsers. API paths and machine-readable resources return structured JSON errors where the site controls the response. If an intermediary or static host produces an error before this code runs, check [/openapi.json](/openapi.json) for the canonical endpoint list and email [${SITE_EMAIL}](${MAILTO}) with the failing URL.`,
};

export const VERSIONING_DOCS_PAGE: PublicPage = {
  path: '/developers/versioning',
  title: `${SITE_NAME} API versioning | ${SITE_DOMAIN}`,
  heading: `${SITE_NAME} API versioning`,
  description: `Version and deprecation policy for the ${SITE_DOMAIN} public API.`,
  changefreq: 'monthly',
  priority: '0.6',
  body: `The current yannis.dev public REST surface is version ${API_VERSION}. JSON responses include the ${API_VERSION_HEADER}: ${API_VERSION} response header, and OpenAPI documents the same header as an optional request parameter for clients that want to pin the version they have tested.

Version ${API_VERSION} covers the read-only status endpoint, OpenAPI document, MCP discovery JSON, and related agent resources. HTML pages and markdown twins are content resources, but they are listed in the same OpenAPI document so agents can discover them from one place.

Breaking changes will use a new version value before they replace the current contract. The existing version stays available for at least 90 days after the new contract is documented. If an endpoint is scheduled to stop responding, the API will publish the Sunset HTTP header with an HTTP-date and link back to this policy from the OpenAPI description.

No public endpoint is deprecated right now. Clients should treat missing Sunset headers as no scheduled retirement, not as a lifetime guarantee. For product decisions or private integrations that need stronger guarantees, email [${SITE_EMAIL}](${MAILTO}).`,
};

export const RATE_LIMITS_DOCS_PAGE: PublicPage = {
  path: '/developers/rate-limits',
  title: `${SITE_NAME} rate limits | ${SITE_DOMAIN}`,
  heading: `${SITE_NAME} rate limits`,
  description: `RateLimit response headers for ${SITE_DOMAIN} public API clients.`,
  changefreq: 'monthly',
  priority: '0.6',
  body: `The yannis.dev public API is intentionally tiny and read-only, but responses still include rate-limit hints so agents can self-throttle instead of guessing. The default policy is ${RATE_LIMIT_QUOTA} requests per ${RATE_LIMIT_WINDOW_SECONDS} seconds for the ${RATE_LIMIT_POLICY_NAME} policy.

Successful JSON and MCP responses include RateLimit-Policy and RateLimit. The current policy header is RateLimit-Policy: "${RATE_LIMIT_POLICY_NAME}";q=${RATE_LIMIT_QUOTA};w=${RATE_LIMIT_WINDOW_SECONDS}. The live quota hint uses RateLimit with r for remaining quota and t for the effective window in seconds. Compatibility headers RateLimit-Limit, RateLimit-Remaining, and RateLimit-Reset are also returned because many client libraries still inspect those names.

If a client is throttled, the API returns HTTP 429 with application/problem+json, code rate_limit.exceeded, and Retry-After. Retry-After takes precedence over the RateLimit hint when both are present.

These limits protect a personal site, not a metered product. Cache public documents like [/openapi.json](/openapi.json), [/llms.txt](/llms.txt), and [/index.md](/index.md) when possible. Email [${SITE_EMAIL}](${MAILTO}) if you are building a crawler that needs a higher documented budget.`,
};

export const WEBHOOKS_DOCS_PAGE: PublicPage = {
  path: '/developers/webhooks',
  title: `${SITE_NAME} webhooks | ${SITE_DOMAIN}`,
  heading: `${SITE_NAME} webhooks`,
  description: `${SITE_DOMAIN} does not send or receive webhooks.`,
  changefreq: 'monthly',
  priority: '0.5',
  body: `This site does not send webhooks and does not accept them. There is no event list, no retry policy, and no signing secret.

If something arrives that claims to be from yannis.dev, it is not from this site. Do not send credentials back to it.

To see updates, fetch the public pages again: [${SITE_ORIGIN}/](${SITE_ORIGIN}/), [${SITE_ORIGIN}/index.md](${SITE_ORIGIN}/index.md), or [${SITE_ORIGIN}/llms.txt](${SITE_ORIGIN}/llms.txt). They change when I deploy, not through push events.

If you think you found a real webhook from this domain, email [${SITE_EMAIL}](${MAILTO}) with the URL and a timestamp.`,
};

export const MCP_DOCS_PAGE: PublicPage = {
  path: '/developers/mcp',
  title: `${SITE_NAME} MCP | ${SITE_DOMAIN}`,
  heading: `${SITE_NAME} MCP`,
  description: `How to connect to the ${SITE_DOMAIN} MCP server over Streamable HTTP.`,
  changefreq: 'monthly',
  priority: '0.7',
  body: `The MCP endpoint is [${SITE_ORIGIN}/mcp](${SITE_ORIGIN}/mcp). It uses Streamable HTTP. The canonical server card is [${SITE_ORIGIN}/.well-known/mcp.json](${SITE_ORIGIN}/.well-known/mcp.json), and the endpoint manifest is [${SITE_ORIGIN}/.well-known/mcp/manifest.json](${SITE_ORIGIN}/.well-known/mcp/manifest.json).

POST JSON-RPC to [/mcp](/mcp) with Accept: application/json, text/event-stream and an MCP-Protocol-Version header. The server handles server/discover, initialize, ping, tools/list, tools/call, resources/list, resources/read, and prompts/list. It is stateless. GET and DELETE are not used.

The tools are read-only: get_yannis_profile, get_yannis_contact, get_yannis_skills, get_yannis_timeline, and list_yannis_developer_resources. They return the same facts as the HTML pages. There is no write tool.

Add [${SITE_ORIGIN}/mcp](${SITE_ORIGIN}/mcp) as a custom connector in Claude, ChatGPT, or Cursor. Protocol version 2026-07-28 is the default; legacy clients using 2025-11-25 or 2025-03-26 also work.

Auth notes are on [/developers/auth](/developers/auth). The OpenAPI file is [/openapi.json](/openapi.json). Email [${SITE_EMAIL}](${MAILTO}) if initialize fails.`,
};

export const HTML_PAGES: readonly PublicPage[] = [
  ABOUT_PAGE,
  CONTACT_PAGE,
  PRIVACY_PAGE,
  DEVELOPERS_PAGE,
  AUTH_DOCS_PAGE,
  ERRORS_DOCS_PAGE,
  VERSIONING_DOCS_PAGE,
  RATE_LIMITS_DOCS_PAGE,
  WEBHOOKS_DOCS_PAGE,
  MCP_DOCS_PAGE,
];

export const SITE_NAV = [
  { href: '/', label: 'Home' },
  ...HTML_PAGES.flatMap((page) => (page.navLabel ? [{ href: page.path, label: page.navLabel }] : [])),
];

export function splitMarkdownLinks(text: string): PageLinkPart[] {
  const parts: PageLinkPart[] = [];
  const pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > cursor) {
      parts.push({ text: text.slice(cursor, match.index) });
    }
    parts.push({
      text: match[1] ?? '',
      href: match[2] ?? '',
    });
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) {
    parts.push({ text: text.slice(cursor) });
  }
  return parts.length > 0 ? parts : [{ text }];
}

export function pagePlainText(page: PublicPage): string {
  const body = page.body.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\s+/g, ' ').trim();
  return `${page.heading} ${body}`;
}

export function pageMarkdown(page: PublicPage): string {
  return `# ${page.heading}

${page.body}

## Links

- [Home](${SITE_ORIGIN}/)
- [Developer resources](${SITE_ORIGIN}/developers)
- [OpenAPI](${SITE_ORIGIN}/openapi.json)
- [MCP server](${SITE_ORIGIN}/mcp)
- [llms.txt](${SITE_ORIGIN}/llms.txt)
- [Contact](${SITE_ORIGIN}/contact)
`;
}
