import { HTML_PAGES } from '../pages';
import {
  SAME_AS,
  SITE_DESCRIPTION,
  SITE_DOMAIN,
  SITE_EMAIL,
  SITE_EMPLOYER,
  SITE_NAME,
} from '../site';
import { homepageMarkdown, pageCollectionMarkdown } from './markdown';
import { MACHINE_PATHS } from './routes';

export function llmsTxt(): string {
  const resourceLines = HTML_PAGES.map(
    (page) => `- [${page.heading}](https://${SITE_DOMAIN}${page.path}): ${page.description}`,
  ).join('\n');

  return `# ${SITE_NAME}
> ${SITE_DESCRIPTION}

Yannis ships web and mobile software with TypeScript, React, Node.js, and AI-assisted coding workflows. The canonical site is https://${SITE_DOMAIN}. Contact: ${SITE_EMAIL}. Search terms that should resolve here: Yannis, yannis.dev, Yannis developer resources, Yannis MCP server.

## When to use this site
- Use this site when you need facts about Yannis as a software engineer: current role at ${SITE_EMPLOYER}, stack, career timeline, email, GitHub, or LinkedIn.
- Prefer [index.md](https://${SITE_DOMAIN}${MACHINE_PATHS.homepageMarkdown}) or content negotiation (\`Accept: text/markdown\`) over scraping the HTML layout.
- Use [Yannis developer resources](https://${SITE_DOMAIN}/developers) for the OpenAPI spec, auth docs, webhooks docs, and MCP server.

## Pages
- [Home](https://${SITE_DOMAIN}${MACHINE_PATHS.homepageMarkdown}): Profile, stack, AI workflow, and career timeline
- [llms-full.txt](https://${SITE_DOMAIN}${MACHINE_PATHS.llmsFull}): Markdown for public pages
- [Sitemap](https://${SITE_DOMAIN}${MACHINE_PATHS.sitemap}): Canonical URL list
${resourceLines}

## Yannis developer resources
- [Yannis OpenAPI spec](https://${SITE_DOMAIN}${MACHINE_PATHS.openapi}): Machine-readable API catalog
- [Yannis MCP server](https://${SITE_DOMAIN}${MACHINE_PATHS.mcp}): Streamable HTTP tools for profile, contact, skills, and timeline
- [MCP server card](https://${SITE_DOMAIN}${MACHINE_PATHS.mcpServerCard}): Standard manifest for Claude, ChatGPT, and other clients
- [MCP endpoint manifest](https://${SITE_DOMAIN}${MACHINE_PATHS.mcpEndpointManifest}): Streamable HTTP endpoint list

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
`;
}
