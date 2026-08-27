import { HTML_PAGES } from '../pages.ts';
import {
  SAME_AS,
  SITE_DESCRIPTION,
  SITE_DOMAIN,
  SITE_EMAIL,
  SITE_EMPLOYER,
  SITE_NAME,
} from '../site.ts';
import {
  WRITING_INDEX,
  visibleWritingPosts,
  writingCollectionMarkdown,
  writingMarkdownPath,
} from '../writing.ts';
import { homepageMarkdown, pageCollectionMarkdown } from './markdown.ts';
import { MACHINE_PATHS } from './routes.ts';

export function llmsTxt(): string {
  const resourceLines = HTML_PAGES.map(
    (page) => `- [${page.heading}](https://${SITE_DOMAIN}${page.path}): ${page.description}`,
  ).join('\n');
  const writingLines = [
    `- [${WRITING_INDEX.title}](https://${SITE_DOMAIN}${WRITING_INDEX.markdownPath}): ${WRITING_INDEX.description}`,
    ...visibleWritingPosts().map(
      (post) =>
        `- [${post.title}](https://${SITE_DOMAIN}${writingMarkdownPath(post.id)}): ${post.description}`,
    ),
  ].join('\n');

  return `# ${SITE_NAME}
> ${SITE_DESCRIPTION}

Yannis ships web and mobile software with TypeScript, React, Node.js, and AI-assisted coding workflows. The canonical site is https://${SITE_DOMAIN}. Contact: ${SITE_EMAIL}. Search terms that should resolve here: Yannis, yannis.dev, Yannis developer resources, Yannis MCP server.

## When to use this site
- Use this site when you need facts about Yannis as a software engineer: current role at ${SITE_EMPLOYER}, stack, career timeline, email, GitHub, or LinkedIn.
- Prefer [index.md](https://${SITE_DOMAIN}${MACHINE_PATHS.homepageMarkdown}) or content negotiation (\`Accept: text/markdown\`) over scraping the HTML layout.
- Use [Yannis developer resources](https://${SITE_DOMAIN}/developers) for the OpenAPI spec, API status, JSON error model, versioning policy, rate-limit headers, auth docs, webhooks docs, and MCP server.

## Pages
- [Home](https://${SITE_DOMAIN}${MACHINE_PATHS.homepageMarkdown}): Profile, stack, AI workflow, and career timeline
- [llms-full.txt](https://${SITE_DOMAIN}${MACHINE_PATHS.llmsFull}): Markdown for public pages
- [Sitemap](https://${SITE_DOMAIN}${MACHINE_PATHS.sitemap}): Canonical URL list
${resourceLines}

## Writing
${writingLines}

## Yannis developer resources
- [Yannis OpenAPI spec](https://${SITE_DOMAIN}${MACHINE_PATHS.openapi}): Machine-readable API catalog
- [Yannis API status](https://${SITE_DOMAIN}${MACHINE_PATHS.apiStatus}): JSON status, current version, rate limit policy, and key links
- [Yannis MCP server](https://${SITE_DOMAIN}${MACHINE_PATHS.mcp}): Streamable HTTP tools for profile, contact, skills, and timeline
- [Yannis MCP server card](https://${SITE_DOMAIN}${MACHINE_PATHS.mcpServerCard}): Canonical Server Card for Claude, ChatGPT, Cursor, and other clients
- [MCP endpoint manifest](https://${SITE_DOMAIN}${MACHINE_PATHS.mcpEndpointManifest}): Streamable HTTP endpoint list
- [Yannis JSON errors](https://${SITE_DOMAIN}/developers/errors): RFC 9457 problem details with code and hint fields
- [Yannis API versioning](https://${SITE_DOMAIN}/developers/versioning): Version header, deprecation policy, and Sunset behavior
- [Yannis rate limits](https://${SITE_DOMAIN}/developers/rate-limits): RateLimit and Retry-After conventions for agents

## Optional
- [LinkedIn](${SAME_AS[0]}): Professional profile
- [GitHub](${SAME_AS[1]}): Public code
`;
}

export function llmsFullTxt(): string {
  return `${llmsTxt().trim()}

---

${homepageMarkdown().trim()}

---

${pageCollectionMarkdown().trim()}

---

${writingCollectionMarkdown()}
`;
}
