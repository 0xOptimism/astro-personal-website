import { describe, expect, it } from 'vitest';
import { homepageMarkdown, markdownForPath, notFoundMarkdown } from '../src/lib/agent/markdown';
import { llmsFullTxt, llmsTxt } from '../src/lib/agent/llms';
import { JSON_LD_SCRIPT, robotsTxt, sitemapXml } from '../src/lib/agent/seo';
import { SOCIAL_PROFILES, SITE_DOMAIN, SITE_EMAIL, SITE_NAME } from '../src/lib/site';
import {
  WRITING_INDEX,
  visibleWritingPosts,
  writingIndexMarkdown,
  writingMarkdownPath,
  writingPath,
  writingPostMarkdown,
} from '../src/lib/writing';

describe('homepage markdown', () => {
  it('has an H1, nested headings, and substantial copy', () => {
    const markdown = homepageMarkdown();
    expect(markdown.startsWith('# Yannis')).toBe(true);
    expect(markdown).toContain('## About Yannis');
    expect(markdown).toContain('### Work');
    expect(markdown.length).toBeGreaterThan(500);
    expect(markdown).toContain(SITE_DOMAIN);
    expect(markdown).toContain(SOCIAL_PROFILES.x);
    expect(markdown).toContain(`https://${SITE_DOMAIN}${WRITING_INDEX.markdownPath}`);
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
    expect(text).toContain('Yannis developer resources');
    expect(text).toContain(`https://${SITE_DOMAIN}/openapi.json`);
    expect(text).toContain(`https://${SITE_DOMAIN}/mcp`);
    expect(text).toContain(`https://${SITE_DOMAIN}/.well-known/mcp.json`);
    expect(text).toContain(`https://${SITE_DOMAIN}/.well-known/mcp/manifest.json`);
    expect(text).toContain(SOCIAL_PROFILES.x);
    expect(text).toContain(`https://${SITE_DOMAIN}${WRITING_INDEX.markdownPath}`);
    for (const post of visibleWritingPosts()) {
      expect(text).toContain(`https://${SITE_DOMAIN}${writingMarkdownPath(post.id)}`);
      expect(text).toContain(post.title);
    }
  });

  it('full version concatenates llms.txt, homepage markdown, and writing', () => {
    const full = llmsFullTxt();
    expect(full).toContain(`# ${SITE_NAME}`);
    expect(full).toContain(homepageMarkdown().trim());
    expect(full).toContain(writingIndexMarkdown().trim());
    for (const post of visibleWritingPosts()) {
      expect(full).toContain(writingPostMarkdown(post).trim());
    }
  });
});

describe('writing markdown negotiation', () => {
  it('serves the writing index and published posts', () => {
    expect(markdownForPath(WRITING_INDEX.path)).toBe(writingIndexMarkdown());
    for (const post of visibleWritingPosts()) {
      expect(markdownForPath(writingPath(post.id))).toBe(writingPostMarkdown(post));
    }
  });

  it('keeps discussion links and nested ids in the catalog markdown', () => {
    for (const post of visibleWritingPosts()) {
      if (post.xPostUrl) {
        expect(writingPostMarkdown(post)).toContain(post.xPostUrl);
      }
    }

    expect(writingPath('notes/example')).toBe('/posts/notes/example');
    expect(writingMarkdownPath('notes/example')).toBe('/posts/notes/example.md');
    expect(markdownForPath('/posts/notes/example')).toBeNull();
  });
});

describe('robots and sitemap', () => {
  it('allows common AI crawlers and lists the sitemap', () => {
    const robots = robotsTxt();
    expect(robots).toContain('User-agent: GPTBot');
    expect(robots).toContain(`Sitemap: https://${SITE_DOMAIN}/sitemap.xml`);
  });

  it('includes the canonical homepage, trust pages, and writing', () => {
    const sitemap = sitemapXml([
      { path: WRITING_INDEX.path, changefreq: 'monthly', priority: '0.8' },
      ...visibleWritingPosts().map((post) => ({
        path: writingPath(post.id),
        changefreq: 'yearly' as const,
        priority: '0.7',
        lastmod: post.pubDate,
      })),
    ]);
    expect(sitemap).toContain(`https://${SITE_DOMAIN}/`);
    expect(sitemap).toContain(`https://${SITE_DOMAIN}/about`);
    expect(sitemap).toContain(`https://${SITE_DOMAIN}/contact`);
    expect(sitemap).toContain(`https://${SITE_DOMAIN}/privacy`);
    expect(sitemap).toContain(`https://${SITE_DOMAIN}/developers`);
    expect(sitemap).toContain(`https://${SITE_DOMAIN}${WRITING_INDEX.path}`);
    for (const post of visibleWritingPosts()) {
      expect(sitemap).toContain(`https://${SITE_DOMAIN}${writingPath(post.id)}`);
    }
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

  it('includes Organization contactPoint and address', () => {
    const parsed = JSON.parse(JSON_LD_SCRIPT) as { '@graph'?: Array<Record<string, unknown>> };
    const organization = parsed['@graph']?.find((node) => node['@type'] === 'Organization');
    expect(organization?.name).toBe(SITE_NAME);
    const contactPoint = organization?.contactPoint as { email?: string; contactType?: string };
    expect(contactPoint.email).toBe(SITE_EMAIL);
    expect(contactPoint.contactType).toBe('customer service');
    const address = organization?.address as { '@type'?: string; addressLocality?: string };
    expect(address['@type']).toBe('PostalAddress');
    expect(address.addressLocality).toBeTruthy();
  });

  it('escapes < in the script payload', () => {
    expect(JSON_LD_SCRIPT).not.toContain('<');
  });
});
