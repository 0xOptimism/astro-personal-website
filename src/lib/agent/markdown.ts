import { HTML_PAGES, pageMarkdown } from '../pages.ts';
import { normalizeIndexHtml } from './routes.ts';
import {
  ABOUT_AGENTS,
  ABOUT_AGENTS_HEADING,
  ABOUT_WORK,
  ABOUT_WORK_HEADING,
  HERO_LEDE,
  HERO_NAME,
  HERO_ROLE,
  SAME_AS,
  SITE_DOMAIN,
  SITE_EMAIL,
  SITE_NAME,
  agenticWorkflow,
  skills,
  timeline,
} from '../site.ts';

export function homepageMarkdown(): string {
  const skillLines = skills.groups
    .map((group: { title: string; items: { name: string }[] }) => {
      const names = group.items.map((item) => item.name).join(', ');
      return `### ${group.title}\n\n${names}`;
    })
    .join('\n\n');

  const workflowLines = agenticWorkflow.tools
    .map((tool: { name: string; role: string; description: string }) => `### ${tool.name}\n\n${tool.role}. ${tool.description}`)
    .join('\n\n');

  const principleLines = agenticWorkflow.principles.map((item: string) => `- ${item}`).join('\n');

  const timelineLines = timeline.years
    .map((year: { year: string; items: { title: string; meta: string; description: string; tags: string[] }[] }) => {
      const items = year.items
        .map((item) => {
          const tags = item.tags.length > 0 ? ` (${item.tags.join(', ')})` : '';
          return `### ${item.title}\n\n${item.meta}${tags}. ${item.description}`;
        })
        .join('\n\n');
      return `## ${year.year}\n\n${items}`;
    })
    .join('\n\n');

  return `# ${HERO_NAME}

${HERO_ROLE} at ${SITE_DOMAIN}

${HERO_LEDE}

## About Yannis

### ${ABOUT_WORK_HEADING}

${ABOUT_WORK}

### ${ABOUT_AGENTS_HEADING}

${ABOUT_AGENTS}

## ${skills.title}

${skills.description}

${skillLines}

## ${agenticWorkflow.title}

${agenticWorkflow.description}

${principleLines}

${workflowLines}

## ${timeline.title}

${timeline.description}

${timelineLines}

## Contact

Email [${SITE_EMAIL}](mailto:${SITE_EMAIL}).

- [Home](https://${SITE_DOMAIN}/)
- [About](https://${SITE_DOMAIN}/about)
- [Contact](https://${SITE_DOMAIN}/contact)
- [Privacy](https://${SITE_DOMAIN}/privacy)
- [Yannis developer resources](https://${SITE_DOMAIN}/developers)
- [OpenAPI](https://${SITE_DOMAIN}/openapi.json)
- [API status](https://${SITE_DOMAIN}/api/status.json)
- [MCP server](https://${SITE_DOMAIN}/mcp)
- [MCP server card](https://${SITE_DOMAIN}/.well-known/mcp.json)
- [JSON errors](https://${SITE_DOMAIN}/developers/errors)
- [API versioning](https://${SITE_DOMAIN}/developers/versioning)
- [Rate limits](https://${SITE_DOMAIN}/developers/rate-limits)
- [Markdown twin](https://${SITE_DOMAIN}/index.md)
- [llms.txt](https://${SITE_DOMAIN}/llms.txt)
- [Sitemap](https://${SITE_DOMAIN}/sitemap.xml)
- [LinkedIn](${SAME_AS[0]})
- [GitHub](${SAME_AS[1]})
`;
}

export function pageCollectionMarkdown(): string {
  return HTML_PAGES.map((page) => pageMarkdown(page).trim()).join('\n\n---\n\n');
}

export function markdownForPath(pathname: string): string | null {
  const path = normalizeIndexHtml(pathname);
  if (path === '/') {
    return homepageMarkdown();
  }

  const page = HTML_PAGES.find((entry) => entry.path === path);
  return page ? pageMarkdown(page) : null;
}

export function notFoundMarkdown(): string {
  return `# Not found

The path you requested does not exist on ${SITE_DOMAIN}.

## Where to look next

- [Home](https://${SITE_DOMAIN}/): Profile of ${SITE_NAME}, full-stack developer
- [About](https://${SITE_DOMAIN}/about): Long-form profile
- [Yannis developer resources](https://${SITE_DOMAIN}/developers): OpenAPI, API status, JSON errors, versioning, rate limits, auth, webhooks, MCP
- [Homepage markdown](https://${SITE_DOMAIN}/index.md): Markdown twin of the homepage
- [llms.txt](https://${SITE_DOMAIN}/llms.txt): Agent index and key links
- [Sitemap](https://${SITE_DOMAIN}/sitemap.xml): Public page list
- [Contact](https://${SITE_DOMAIN}/contact): Email ${SITE_EMAIL}
`;
}

export function notAcceptableBody(requested: string): string {
  return `This resource is available in:
- text/html
- text/markdown

You requested: ${requested || '(empty Accept)'}
`;
}
