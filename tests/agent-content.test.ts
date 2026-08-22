import { describe, expect, it } from 'vitest';
import { homepageMarkdown, notFoundMarkdown } from '../src/lib/agent/markdown';
import { llmsFullTxt, llmsTxt } from '../src/lib/agent/llms';
import { JSON_LD_SCRIPT, robotsTxt, sitemapXml } from '../src/lib/agent/seo';
import { SITE_DOMAIN, SITE_EMAIL, SITE_NAME } from '../src/lib/site';

describe('homepage markdown', () => {
  it('has an H1, nested headings, and substantial copy', () => {
    const markdown = homepageMarkdown();
    expect(markdown.startsWith('# Yannis')).toBe(true);
    expect(markdown).toContain('## About Yannis');
    expect(markdown).toContain('### Work');
    expect(markdown.length).toBeGreaterThan(500);
    expect(markdown).toContain(SITE_DOMAIN);
  });
});

describe('agent 404 markdown', () => {
  it('points agents at sitemap, llms.txt, and contact', () => {
    const body = notFoundMarkdown();
    expect(body.startsWith('# Not found')).toBe(true);
    expect(body).toContain(`https://${SITE_DOMAIN}/llms.txt`);
    expect(body).toContain(`https://${SITE_DOMAIN}/sitemap.xml`);
    expect(body).toContain(SITE_EMAIL);
  });
});

describe('llms.txt', () => {
  it('follows the H1 + blockquote + file list format', () => {
    const text = llmsTxt();
    expect(text.startsWith(`# ${SITE_NAME}\n>`)).toBe(true);
    expect(text).toContain('## When to use this site');
    expect(text).toContain(`https://${SITE_DOMAIN}/index.md`);
    expect(text).toContain(`https://${SITE_DOMAIN}/sitemap.xml`);
  });

  it('full version concatenates llms.txt and homepage markdown', () => {
    const full = llmsFullTxt();
    expect(full).toContain(`# ${SITE_NAME}`);
    expect(full).toContain(homepageMarkdown().trim());
  });
});

describe('robots and sitemap', () => {
  it('allows common AI crawlers and lists the sitemap', () => {
    const robots = robotsTxt();
    expect(robots).toContain('User-agent: GPTBot');
    expect(robots).toContain(`Sitemap: https://${SITE_DOMAIN}/sitemap.xml`);
  });

  it('includes the canonical homepage', () => {
    const sitemap = sitemapXml();
    expect(sitemap).toContain(`https://${SITE_DOMAIN}/`);
  });
});

describe('JSON-LD', () => {
  it('is a Person identity with required fields', () => {
    const parsed = JSON.parse(JSON_LD_SCRIPT) as { '@graph'?: Array<Record<string, unknown>> };
    const person = parsed['@graph']?.find((node) => node['@type'] === 'Person');
    expect(person).toBeDefined();
    if (!person) return;
    expect(person.name).toBe(SITE_NAME);
    expect(person.description).toBeTruthy();
    expect(person.url).toBe(`https://${SITE_DOMAIN}`);
  });

  it('escapes < in the script payload', () => {
    expect(JSON_LD_SCRIPT).not.toContain('<');
  });
});
