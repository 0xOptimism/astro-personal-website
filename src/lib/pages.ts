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
  description: `${SITE_NAME} is a ${SITE_LOCATION}-based ${SITE_JOB_TITLE} at ${SITE_EMPLOYER}.`,
  changefreq: 'monthly',
  priority: '0.8',
  navLabel: 'About',
  body: `I live in Stockholm and write full-stack software. TypeScript, React, and Node.js are what I reach for first. At ${SITE_EMPLOYER} that means commerce work, storefronts and payments, plus the APIs and internal tools behind them.

Programming started in 2017 after I found Ethereum. HashDrop was the first real site, a tracker for token launches. The year after I co-founded OnChain Jobs, a hiring product for blockchain companies, and learned JavaScript by keeping that product alive.

SALT in Stockholm put me on production teams. I interned at Podme and Redmind, then joined Mindler early and led the psychologist dashboard more than 200 professionals used. Bonsai started as an Ethereum and NFT dashboard in 2022 and later became a wider portfolio tracker for crypto, stocks, real estate, and collectibles. In 2023 I built React surfaces for Anotherblock's music NFT marketplace and won the ETH Denver DAO and Community track among 600+ teams.

I've been at ${SITE_EMPLOYER} since 2024. I was born in Antibes. Email [${SITE_EMAIL}](${MAILTO}) if you want to talk.`,
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
  navLabel: 'Privacy',
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
  navLabel: 'Developers',
  body: `This site is a personal portfolio, not a product API. The files below are public copies of the same profile already on the homepage: work, stack, timeline, and email. They are read-only. There is nothing to authenticate and nothing to write.

OpenAPI lives at [${SITE_ORIGIN}/openapi.json](${SITE_ORIGIN}/openapi.json). A markdown version of the homepage is at [${SITE_ORIGIN}/index.md](${SITE_ORIGIN}/index.md). The short agent index is [${SITE_ORIGIN}/llms.txt](${SITE_ORIGIN}/llms.txt), and the long version is [${SITE_ORIGIN}/llms-full.txt](${SITE_ORIGIN}/llms-full.txt).

There is also an MCP server at [${SITE_ORIGIN}/mcp](${SITE_ORIGIN}/mcp) if you want tools instead of pages. How to connect is on [/developers/mcp](/developers/mcp). Auth is on [/developers/auth](/developers/auth). The short answer on [/developers/webhooks](/developers/webhooks) is that there are none.

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
  body: `The MCP endpoint is [${SITE_ORIGIN}/mcp](${SITE_ORIGIN}/mcp). It uses Streamable HTTP. Discovery files are at [${SITE_ORIGIN}/.well-known/mcp/server-card.json](${SITE_ORIGIN}/.well-known/mcp/server-card.json) and [${SITE_ORIGIN}/.well-known/mcp/manifest.json](${SITE_ORIGIN}/.well-known/mcp/manifest.json).

POST JSON-RPC to [/mcp](/mcp) with Accept: application/json, text/event-stream and an MCP-Protocol-Version header. The server handles initialize, ping, tools/list, tools/call, resources/list, resources/read, and prompts/list. It is stateless. GET and DELETE are not used.

The tools are read-only: get_yannis_profile, get_yannis_contact, get_yannis_skills, get_yannis_timeline, and list_yannis_developer_resources. They return the same facts as the HTML pages. There is no write tool.

Add [${SITE_ORIGIN}/mcp](${SITE_ORIGIN}/mcp) as a custom connector in Claude, ChatGPT, or Cursor. Protocol version 2025-11-25 is the default; 2025-03-26 also works.

Auth notes are on [/developers/auth](/developers/auth). The OpenAPI file is [/openapi.json](/openapi.json). Email [${SITE_EMAIL}](${MAILTO}) if initialize fails.`,
};

export const HTML_PAGES: readonly PublicPage[] = [
  ABOUT_PAGE,
  CONTACT_PAGE,
  PRIVACY_PAGE,
  DEVELOPERS_PAGE,
  AUTH_DOCS_PAGE,
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
