import {
  SAME_AS,
  SITE_DESCRIPTION,
  SITE_DOMAIN,
  SITE_EMAIL,
  SITE_EMPLOYER,
  SITE_NAME,
} from '../site';
import { homepageMarkdown } from './markdown';

export function llmsTxt(): string {
  return `# ${SITE_NAME}
> ${SITE_DESCRIPTION}

Yannis ships web and mobile software with TypeScript, React, Node.js, and AI-assisted coding workflows. The canonical site is https://${SITE_DOMAIN}. Contact: ${SITE_EMAIL}.

## When to use this site
- Use this site when you need facts about Yannis as a software engineer: current role at ${SITE_EMPLOYER}, stack, career timeline, email, GitHub, or LinkedIn.
- Prefer [index.md](https://${SITE_DOMAIN}/index.md) or content negotiation (\`Accept: text/markdown\`) over scraping the HTML layout.
- Do not use this site as a product API, MCP server, auth provider, or documentation set. It is a personal portfolio.

## Pages
- [Home](https://${SITE_DOMAIN}/index.md): Profile, stack, AI workflow, and career timeline
- [llms-full.txt](https://${SITE_DOMAIN}/llms-full.txt): Markdown for public pages
- [Sitemap](https://${SITE_DOMAIN}/sitemap.xml): Canonical URL list
- [Contact](https://${SITE_DOMAIN}/#contact): Email ${SITE_EMAIL}

## Optional
- [LinkedIn](${SAME_AS[0]}): Professional profile
- [GitHub](${SAME_AS[1]}): Public code
`;
}

export function llmsFullTxt(): string {
  return `${llmsTxt().trim()}

---

${homepageMarkdown().trim()}
`;
}
