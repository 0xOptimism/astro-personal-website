import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { GET as getIndexMarkdown } from '../src/pages/index.md.ts';
import { GET as getLlms } from '../src/pages/llms.txt.ts';
import { GET as getOpenApi } from '../src/pages/openapi.json.ts';
import { homepageMarkdown } from '../src/lib/agent/markdown';
import { llmsTxt } from '../src/lib/agent/llms';
import { JSON_LD_SCRIPT } from '../src/lib/agent/seo';
import { HTML_PAGES } from '../src/lib/pages';
import { openApiJson } from '../src/lib/agent/openapi';
import {
  SITE_OG_IMAGE_ALT,
  SITE_OG_IMAGE_HEIGHT,
  SITE_OG_IMAGE_PATH,
  SITE_OG_IMAGE_WIDTH,
  SITE_ORIGIN,
} from '../src/lib/site';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const distIndex = join(root, 'dist', 'index.html');
const dist404 = join(root, 'dist', '404.html');
const distBuilt = existsSync(distIndex);

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractHeadings(html: string, tag: 'h1' | 'h2' | 'h3'): string[] {
  const matches = html.match(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi')) ?? [];
  return matches.filter((block) => !/<a\b/i.test(block));
}

describe.skipIf(!distBuilt)('built homepage HTML', () => {
  const html = readFileSync(distIndex, 'utf8');
  const text = stripHtml(html);

  it('includes a visible H1 and nested H2/H3 outside links', () => {
    expect(extractHeadings(html, 'h1').join(' ')).toMatch(/Yannis/);
    expect(html).toContain('id="page-title"');
    expect(extractHeadings(html, 'h2').length).toBeGreaterThan(0);
    expect(extractHeadings(html, 'h3').length).toBeGreaterThan(0);
  });

  it('has at least 500 characters of text in raw HTML', () => {
    expect(text.length).toBeGreaterThanOrEqual(500);
  });

  it('embeds Person JSON-LD in the first response', () => {
    expect(html).toContain(JSON_LD_SCRIPT);
    const parsed = JSON.parse(JSON_LD_SCRIPT) as { '@graph'?: Array<Record<string, unknown>> };
    const person = parsed['@graph']?.find((node) => node['@type'] === 'Person');
    expect(person?.name).toBe('Yannis');
    expect(person?.url).toBe('https://yannis.dev');
  });

  it('includes the four homepage metadata signals', () => {
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('rel="canonical" href="https://yannis.dev/"');
    expect(html).toContain('property="og:image" content="https://yannis.dev/og-image.png"');
    expect(html).toContain('property="og:type" content="profile"');
  });

  it('includes social preview metadata', () => {
    const imageUrl = new URL(SITE_OG_IMAGE_PATH, SITE_ORIGIN).href;

    expect(html).toContain(`property="og:image" content="${imageUrl}"`);
    expect(html).toContain(`property="og:image:width" content="${SITE_OG_IMAGE_WIDTH}"`);
    expect(html).toContain(`property="og:image:height" content="${SITE_OG_IMAGE_HEIGHT}"`);
    expect(html).toContain(`property="og:image:alt" content="${SITE_OG_IMAGE_ALT}"`);
    expect(html).toContain('name="twitter:card" content="summary_large_image"');
    expect(html).toContain(`name="twitter:image" content="${imageUrl}"`);
  });

  it('does not hide the H1 behind a reveal class', () => {
    const h1 = html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/i)?.[0] ?? '';
    expect(h1).not.toMatch(/class="[^"]*reveal[^"]*"/);
  });
});

describe.skipIf(!existsSync(dist404))('built 404 HTML', () => {
  const html = readFileSync(dist404, 'utf8');

  it('includes a markdown recovery body and agent links', () => {
    expect(html).toMatch(/<h1\b[^>]*>\s*Not found\s*<\/h1>/i);
    expect(html).toContain('/llms.txt');
    expect(html).toContain('/sitemap.xml');
    expect(html).toContain('# Not found');
  });
});

function distHtmlPath(pathname: string): string {
  const segments = pathname.replace(/^\/|\/$/g, '').split('/').filter(Boolean);
  const asDirectory = join(root, 'dist', ...segments, 'index.html');
  const asFile = join(root, 'dist', ...segments.slice(0, -1), `${segments.at(-1)}.html`);
  if (existsSync(asDirectory)) return asDirectory;
  if (existsSync(asFile)) return asFile;
  return asDirectory;
}

describe.skipIf(!distBuilt)('built trust pages', () => {
  it.each(HTML_PAGES)('$path is server-rendered with H1 and 500+ chars', (page) => {
    const html = readFileSync(distHtmlPath(page.path), 'utf8');
    expect(html).toMatch(new RegExp(`<h1\\b[^>]*>\\s*${page.heading}\\s*</h1>`, 'i'));
    expect(stripHtml(html).length).toBeGreaterThanOrEqual(500);
  });
});

describe('public endpoint handlers', () => {
  it('serves homepage markdown from /index.md', async () => {
    const response = await getIndexMarkdown({} as never);
    expect(response.headers.get('Content-Type')).toContain('text/markdown');
    expect(await response.text()).toBe(homepageMarkdown());
  });

  it('serves llms.txt as markdown', async () => {
    const response = await getLlms({} as never);
    expect(response.headers.get('Content-Type')).toContain('text/markdown');
    expect(await response.text()).toBe(llmsTxt());
  });

  it('serves OpenAPI from /openapi.json', async () => {
    const spec = await getOpenApi({} as never);
    expect(await spec.text()).toBe(openApiJson());
  });
});
