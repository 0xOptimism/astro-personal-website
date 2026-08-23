import { describe, expect, it } from 'vitest';
import handler from '../netlify/edge-functions/negotiate-markdown';
import { homepageMarkdown, notFoundMarkdown } from '../src/lib/agent/markdown';
import { MARKDOWN_CONTENT_TYPE } from '../src/lib/agent/negotiate';
import { ABOUT_PAGE, pageMarkdown } from '../src/lib/pages';

async function originHtml(): Promise<Response> {
  return new Response('<html>ok</html>', {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', Vary: 'Accept-Encoding' },
  });
}

describe('Netlify edge markdown negotiation', () => {
  it('treats /index.html as the homepage for markdown negotiation', async () => {
    const response = await handler(
      new Request('https://yannis.dev/index.html', { headers: { Accept: 'text/markdown' } }),
      { next: originHtml },
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toBe(homepageMarkdown());
  });

  it('serves text/markdown with Vary: Accept for the homepage', async () => {
    const response = await handler(
      new Request('https://yannis.dev/', { headers: { Accept: 'text/markdown' } }),
      { next: originHtml },
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe(MARKDOWN_CONTENT_TYPE);
    expect(response.headers.get('Vary')?.toLowerCase()).toContain('accept');
    expect(await response.text()).toBe(homepageMarkdown());
  });

  it('returns HTTP 404 markdown for unknown paths', async () => {
    const response = await handler(
      new Request('https://yannis.dev/some-path-that-does-not-exist', {
        headers: { Accept: 'text/markdown' },
      }),
      { next: originHtml },
    );
    expect(response.status).toBe(404);
    expect(response.headers.get('Content-Type')).toBe(MARKDOWN_CONTENT_TYPE);
    expect(response.headers.get('Vary')?.toLowerCase()).toContain('accept');
    expect(await response.text()).toBe(notFoundMarkdown());
  });

  it('returns 406 when no produced type is acceptable', async () => {
    const response = await handler(
      new Request('https://yannis.dev/', { headers: { Accept: 'application/pdf' } }),
      { next: originHtml },
    );
    expect(response.status).toBe(406);
    expect(response.headers.get('Vary')?.toLowerCase()).toContain('accept');
  });

  it('adds Accept to Vary for HTML responses', async () => {
    const response = await handler(new Request('https://yannis.dev/'), { next: originHtml });
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/html');
    const tokens = response.headers.get('Vary')?.split(',').map((token) => token.trim().toLowerCase()) ?? [];
    expect(tokens).toContain('accept');
    expect(tokens).toContain('accept-encoding');
  });

  it('serves about markdown for Accept: text/markdown', async () => {
    const response = await handler(
      new Request('https://yannis.dev/about', { headers: { Accept: 'text/markdown' } }),
      { next: originHtml },
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toBe(pageMarkdown(ABOUT_PAGE));
  });

  it('does not rewrite the MCP endpoint', async () => {
    const response = await handler(
      new Request('https://yannis.dev/mcp', { method: 'GET', headers: { Accept: 'application/json, text/event-stream' } }),
      { next: originHtml },
    );
    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toContain('POST');
  });

  it('serves MCP initialize over POST', async () => {
    const response = await handler(
      new Request('https://yannis.dev/mcp', {
        method: 'POST',
        headers: { Accept: 'application/json, text/event-stream', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: { protocolVersion: '2025-11-25' },
        }),
      }),
      { next: originHtml },
    );
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.result.protocolVersion).toBe('2025-11-25');
    expect(body.result.serverInfo.name).toBe('yannis-dev');
  });

  it('serves read-only MCP tools over POST', async () => {
    const response = await handler(
      new Request('https://yannis.dev/mcp', {
        method: 'POST',
        headers: { Accept: 'application/json, text/event-stream', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'tools',
          method: 'tools/list',
        }),
      }),
      { next: originHtml },
    );
    const body = await response.json();
    expect(body.result.tools.map((tool: { name: string }) => tool.name)).toContain('get_yannis_profile');
  });

  it('serves MCP resources over POST', async () => {
    const response = await handler(
      new Request('https://yannis.dev/mcp', {
        method: 'POST',
        headers: { Accept: 'application/json, text/event-stream', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'resource',
          method: 'resources/read',
          params: { uri: 'https://yannis.dev/index.md' },
        }),
      }),
      { next: originHtml },
    );
    const body = await response.json();
    expect(body.result.contents[0].mimeType).toBe('text/markdown');
    expect(body.result.contents[0].text).toContain('# Yannis');
  });

  it('passes through static files like llms.txt even when Accept prefers markdown', async () => {
    const staticResponse = new Response('llms body', {
      status: 200,
      headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
    const response = await handler(
      new Request('https://yannis.dev/llms.txt', { headers: { Accept: 'text/markdown' } }),
      { next: async () => staticResponse },
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('llms body');
  });
});
