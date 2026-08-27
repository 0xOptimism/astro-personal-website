import { describe, expect, it } from 'vitest';
import {
  ABOUT_PAGE,
  AUTH_DOCS_PAGE,
  CONTACT_PAGE,
  DEVELOPERS_PAGE,
  HTML_PAGES,
  MCP_DOCS_PAGE,
  PRIVACY_PAGE,
  SITE_NAV,
  WEBHOOKS_DOCS_PAGE,
  pageMarkdown,
  pagePlainText,
  splitMarkdownLinks,
} from '../src/lib/pages';
import { SAME_AS, SITE_EMAIL } from '../src/lib/site';
import { AGENTIC_REPORT_COPY, AGENTIC_REPORT_URL } from '../src/lib/agentic-report';

describe('trust and developer pages', () => {
  it.each(HTML_PAGES)('$heading has an H1 title and 500+ characters', (page) => {
    expect(page.heading.length).toBeGreaterThan(0);
    expect(pagePlainText(page).length).toBeGreaterThanOrEqual(500);
    expect(page.title).toContain('Yannis');
    if (page.path !== '/privacy') {
      expect(page.heading).toContain('Yannis');
    }
  });

  it('covers About, Contact, Privacy, and Yannis developer resources', () => {
    expect(ABOUT_PAGE.path).toBe('/about');
    expect(CONTACT_PAGE.path).toBe('/contact');
    expect(PRIVACY_PAGE.path).toBe('/privacy');
    expect(DEVELOPERS_PAGE.path).toBe('/developers');
    expect(AUTH_DOCS_PAGE.path).toBe('/developers/auth');
    expect(WEBHOOKS_DOCS_PAGE.path).toBe('/developers/webhooks');
    expect(MCP_DOCS_PAGE.path).toBe('/developers/mcp');
    expect(SITE_NAV).toEqual([
      { href: '/', label: 'Home' },
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Contact' },
    ]);
  });

  it('writes emails and social names as markdown links', () => {
    const contact = splitMarkdownLinks(CONTACT_PAGE.body.split('\n\n')[0] ?? '');
    expect(contact).toContainEqual({
      text: SITE_EMAIL,
      href: `mailto:${SITE_EMAIL}`,
    });

    const social = splitMarkdownLinks(CONTACT_PAGE.body.split('\n\n')[3] ?? '');
    expect(social).toContainEqual({
      text: 'LinkedIn',
      href: SAME_AS[0],
    });
    expect(social).toContainEqual({
      text: 'GitHub',
      href: SAME_AS[1],
    });

    expect(DEVELOPERS_PAGE.body).toContain('[https://yannis.dev/openapi.json](https://yannis.dev/openapi.json)');
    expect(pageMarkdown(ABOUT_PAGE)).toContain(`[${SITE_EMAIL}](mailto:${SITE_EMAIL})`);
  });

  it('includes the agent-readiness appendix in About markdown', () => {
    expect(pageMarkdown(ABOUT_PAGE)).toContain(AGENTIC_REPORT_COPY.heading);
    expect(pageMarkdown(ABOUT_PAGE)).toContain(AGENTIC_REPORT_URL);
  });
});
