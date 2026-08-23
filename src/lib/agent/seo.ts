import { HTML_PAGES } from '../pages.ts';
import {
  KNOWS_ABOUT,
  SAME_AS,
  SITE_COUNTRY,
  SITE_DESCRIPTION,
  SITE_DOMAIN,
  SITE_EMAIL,
  SITE_EMPLOYER,
  SITE_JOB_TITLE,
  SITE_LOCATION,
  SITE_NAME,
  SITE_OG_IMAGE_PATH,
  SITE_TITLE,
} from '../site.ts';

const siteImageUrl = `https://${SITE_DOMAIN}${SITE_OG_IMAGE_PATH}`;
const postalAddress = {
  '@type': 'PostalAddress',
  addressLocality: SITE_LOCATION,
  addressCountry: SITE_COUNTRY,
};
const contactPoint = {
  '@type': 'ContactPoint',
  email: SITE_EMAIL,
  contactType: 'customer service',
  url: `https://${SITE_DOMAIN}/contact`,
  availableLanguage: ['English'],
};

export const JSON_LD_SCRIPT = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `https://${SITE_DOMAIN}/#person`,
      name: SITE_NAME,
      url: `https://${SITE_DOMAIN}`,
      email: SITE_EMAIL,
      jobTitle: SITE_JOB_TITLE,
      description: SITE_DESCRIPTION,
      image: siteImageUrl,
      sameAs: [...SAME_AS],
      knowsAbout: KNOWS_ABOUT,
      worksFor: { '@type': 'Organization', name: SITE_EMPLOYER },
      homeLocation: {
        '@type': 'Place',
        name: SITE_LOCATION,
        address: postalAddress,
      },
    },
    {
      '@type': 'Organization',
      '@id': `https://${SITE_DOMAIN}/#organization`,
      name: SITE_NAME,
      legalName: SITE_NAME,
      alternateName: [
        SITE_DOMAIN,
        `${SITE_NAME} full-stack developer`,
        `${SITE_NAME} developer resources`,
        `${SITE_NAME} MCP server`,
      ],
      url: `https://${SITE_DOMAIN}`,
      logo: siteImageUrl,
      image: siteImageUrl,
      email: SITE_EMAIL,
      description: SITE_DESCRIPTION,
      sameAs: [...SAME_AS],
      founder: { '@id': `https://${SITE_DOMAIN}/#person` },
      contactPoint,
      address: postalAddress,
    },
    {
      '@type': 'WebSite',
      '@id': `https://${SITE_DOMAIN}/#website`,
      name: SITE_NAME,
      alternateName: [
        SITE_DOMAIN,
        `${SITE_NAME} full-stack developer`,
        `${SITE_NAME} developer resources`,
        `${SITE_NAME} API`,
      ],
      url: `https://${SITE_DOMAIN}`,
      description: SITE_DESCRIPTION,
      image: siteImageUrl,
      inLanguage: 'en',
      publisher: { '@id': `https://${SITE_DOMAIN}/#organization` },
      author: { '@id': `https://${SITE_DOMAIN}/#person` },
    },
    {
      '@type': 'ProfilePage',
      '@id': `https://${SITE_DOMAIN}/#profile`,
      url: `https://${SITE_DOMAIN}`,
      name: SITE_TITLE,
      description: SITE_DESCRIPTION,
      image: siteImageUrl,
      about: { '@id': `https://${SITE_DOMAIN}/#person` },
      mainEntity: { '@id': `https://${SITE_DOMAIN}/#person` },
      isPartOf: { '@id': `https://${SITE_DOMAIN}/#website` },
    },
  ],
}).replace(/</g, '\u003c');

export function robotsTxt(): string {
  return `User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

Sitemap: https://${SITE_DOMAIN}/sitemap.xml
`;
}

export function sitemapXml(): string {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = [
    { path: '/', changefreq: 'monthly', priority: '1.0' },
    ...HTML_PAGES.map((page) => ({
      path: page.path,
      changefreq: page.changefreq,
      priority: page.priority,
    })),
  ];
  const body = urls
    .map(
      (entry) => `  <url>
    <loc>https://${SITE_DOMAIN}${entry.path}</loc>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
    <lastmod>${lastmod}</lastmod>
  </url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

export function homepageLinkHeader(): string {
  return `<https://${SITE_DOMAIN}/index.md>; rel="alternate"; type="text/markdown", <https://${SITE_DOMAIN}/llms.txt>; rel="describedby"`;
}
