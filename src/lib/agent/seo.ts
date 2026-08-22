import { SAME_AS, SITE_COUNTRY, SITE_DESCRIPTION, SITE_DOMAIN, SITE_EMAIL, SITE_EMPLOYER, SITE_JOB_TITLE, SITE_LOCATION, SITE_NAME, SITE_TITLE, KNOWS_ABOUT } from '../site';

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
      sameAs: [...SAME_AS],
      knowsAbout: KNOWS_ABOUT,
      worksFor: { '@type': 'Organization', name: SITE_EMPLOYER },
      homeLocation: {
        '@type': 'Place',
        name: SITE_LOCATION,
        address: {
          '@type': 'PostalAddress',
          addressLocality: SITE_LOCATION,
          addressCountry: SITE_COUNTRY,
        },
      },
    },
    {
      '@type': 'WebSite',
      '@id': `https://${SITE_DOMAIN}/#website`,
      name: SITE_NAME,
      alternateName: [SITE_DOMAIN, 'Yannis full-stack developer'],
      url: `https://${SITE_DOMAIN}`,
      description: SITE_DESCRIPTION,
      inLanguage: 'en',
      publisher: { '@id': `https://${SITE_DOMAIN}/#person` },
      author: { '@id': `https://${SITE_DOMAIN}/#person` },
    },
    {
      '@type': 'ProfilePage',
      '@id': `https://${SITE_DOMAIN}/#profile`,
      url: `https://${SITE_DOMAIN}`,
      name: SITE_TITLE,
      description: SITE_DESCRIPTION,
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
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://${SITE_DOMAIN}/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
    <lastmod>${lastmod}</lastmod>
  </url>
</urlset>
`;
}

export function homepageLinkHeader(): string {
  return `<https://${SITE_DOMAIN}/index.md>; rel="alternate"; type="text/markdown", <https://${SITE_DOMAIN}/llms.txt>; rel="describedby"`;
}
