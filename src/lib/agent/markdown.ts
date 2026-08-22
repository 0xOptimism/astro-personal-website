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
} from '../site';

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

Email [${SITE_EMAIL}](mailto:${SITE_EMAIL}) or use the form on [yannis.dev](https://${SITE_DOMAIN}/#contact).

- [Home](https://${SITE_DOMAIN}/)
- [Markdown twin](https://${SITE_DOMAIN}/index.md)
- [llms.txt](https://${SITE_DOMAIN}/llms.txt)
- [Sitemap](https://${SITE_DOMAIN}/sitemap.xml)
- [LinkedIn](${SAME_AS[0]})
- [GitHub](${SAME_AS[1]})
`;
}

export function notFoundMarkdown(): string {
  return `# Not found

The path you requested does not exist on ${SITE_DOMAIN}.

## Where to look next

- [Home](https://${SITE_DOMAIN}/): Profile of ${SITE_NAME}, full-stack developer
- [Homepage markdown](https://${SITE_DOMAIN}/index.md): Markdown twin of the homepage
- [llms.txt](https://${SITE_DOMAIN}/llms.txt): Agent index, when-to-use notes, and key links
- [Sitemap](https://${SITE_DOMAIN}/sitemap.xml): Machine-readable list of pages
- [Contact](https://${SITE_DOMAIN}/#contact): Email ${SITE_EMAIL}
`;
}

export function notAcceptableBody(requested: string): string {
  return `This resource is available in:
- text/html
- text/markdown

You requested: ${requested || '(empty Accept)'}
`;
}
