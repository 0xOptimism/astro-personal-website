import { Readable } from 'node:stream';
import { describe, expect, it } from 'vitest';
import {
  MCP_PROTOCOL_VERSION,
  MCP_RESOURCES,
  MCP_TOOLS,
  handleJsonRpc,
  handleMcpHttp,
  mcpEndpointManifest,
  mcpServerCard,
} from '../src/lib/agent/mcp';
import { mcpDevConnectMiddleware } from '../src/lib/agent/mcp-dev-middleware';
import { GET as getMcp } from '../src/pages/mcp';
import { SITE_EMAIL, SITE_NAME } from '../src/lib/site';
import { API_VERSION, API_VERSION_HEADER } from '../src/lib/agent/http';
import {
  WRITING_INDEX,
  visibleWritingPosts,
  writingIndexMarkdown,
  writingMarkdownPath,
  writingPostMarkdown,
} from '../src/lib/writing';

const LEGACY_PROTOCOL_VERSION = '2025-11-25';

describe('MCP manifests', () => {
  it('publishes a Streamable HTTP server card', () => {
    const card = mcpServerCard();
    expect(card.$schema).toBe('https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json');
    expect(card.name).toBe('dev.yannis/profile');
    expect(card.name).toMatch(/^[a-zA-Z0-9.-]+\/[a-zA-Z0-9._-]+$/);
    expect(card.description.length).toBeLessThanOrEqual(100);
    expect(card.remotes).toEqual([
      {
        type: 'streamable-http',
        url: 'https://yannis.dev/mcp',
        supportedProtocolVersions: expect.arrayContaining([MCP_PROTOCOL_VERSION, LEGACY_PROTOCOL_VERSION]),
      },
    ]);
    expect(card).not.toHaveProperty('tools');
    expect(card).not.toHaveProperty('resources');
    expect(card).not.toHaveProperty('transport');
    expect(card.title).toBe(`${SITE_NAME} MCP server`);
  });

  it('publishes a SEP-1960 endpoint manifest', () => {
    const manifest = mcpEndpointManifest();
    expect(manifest.mcp_version).toBe(MCP_PROTOCOL_VERSION);
    expect(manifest.endpoints).toEqual([
      expect.objectContaining({
        url: 'https://yannis.dev/mcp',
        transport: 'streamable-http',
        auth: { type: 'none' },
      }),
    ]);
  });
});

describe('MCP JSON-RPC', () => {
  it('initializes with tools and resources capabilities', () => {
    const response = handleJsonRpc({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: { protocolVersion: LEGACY_PROTOCOL_VERSION, capabilities: {}, clientInfo: { name: 'test', version: '1' } },
    });
    expect(response.status).toBe(200);
    const body = response.body as { result: { protocolVersion: string; capabilities: { tools: unknown } } };
    expect(body.result.protocolVersion).toBe(LEGACY_PROTOCOL_VERSION);
    expect(body.result.capabilities.tools).toBeTruthy();
  });

  it('supports modern server/discover handshake', () => {
    const response = handleJsonRpc({
      jsonrpc: '2.0',
      id: 'discover-1',
      method: 'server/discover',
      params: {
        _meta: {
          'io.modelcontextprotocol/protocolVersion': MCP_PROTOCOL_VERSION,
          'io.modelcontextprotocol/clientInfo': { name: 'test', version: '1' },
          'io.modelcontextprotocol/clientCapabilities': {},
        },
      },
    });

    expect(response.status).toBe(200);
    const body = response.body as {
      result: {
        supportedVersions: string[];
        resultType: string;
        cacheScope: string;
        _meta: { 'io.modelcontextprotocol/serverInfo': { name: string } };
      };
    };
    expect(body.result.resultType).toBe('complete');
    expect(body.result.supportedVersions).toContain('2026-07-28');
    expect(body.result.cacheScope).toBe('public');
    expect(body.result._meta['io.modelcontextprotocol/serverInfo'].name).toBe('dev.yannis/profile');
  });

  it('lists Yannis tools and returns profile contact', () => {
    const list = handleJsonRpc({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
    const listed = (list.body as { result: { tools: { name: string }[] } }).result.tools.map((tool) => tool.name);
    expect(listed).toEqual(MCP_TOOLS.map((tool) => tool.name));

    const call = handleJsonRpc({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: { name: 'get_yannis_contact', arguments: {} },
    });
    const result = (call.body as { result: { structuredContent: { email: string } } }).result;
    expect(result.structuredContent.email).toBe(SITE_EMAIL);
  });

  it('lists and reads writing resources from the catalog', () => {
    const list = handleJsonRpc({ jsonrpc: '2.0', id: 4, method: 'resources/list' });
    const resources = (list.body as { result: { resources: { uri: string }[] } }).result.resources;
    const uris = resources.map((resource) => resource.uri);
    const indexUri = `https://yannis.dev${WRITING_INDEX.markdownPath}`;

    expect(uris).toContain(indexUri);

    const indexRead = handleJsonRpc({
      jsonrpc: '2.0',
      id: 5,
      method: 'resources/read',
      params: { uri: indexUri },
    });
    expect((indexRead.body as { result: { contents: { text: string }[] } }).result.contents[0]?.text).toBe(
      writingIndexMarkdown(),
    );

    for (const post of visibleWritingPosts()) {
      const articleUri = `https://yannis.dev${writingMarkdownPath(post.id)}`;
      expect(uris).toContain(articleUri);
      expect(MCP_RESOURCES.some((resource) => resource.uri === articleUri)).toBe(true);

      const read = handleJsonRpc({
        jsonrpc: '2.0',
        id: 6,
        method: 'resources/read',
        params: { uri: articleUri },
      });
      expect((read.body as { result: { contents: { text: string }[] } }).result.contents[0]?.text).toBe(
        writingPostMarkdown(post),
      );
    }
  });

  it('accepts initialized notifications', () => {
    const response = handleJsonRpc({ jsonrpc: '2.0', method: 'notifications/initialized' });
    expect(response.status).toBe(202);
    expect(response.body).toBeNull();
  });
});

describe('MCP Streamable HTTP', () => {
  it('answers initialize over POST JSON', async () => {
    const response = await handleMcpHttp(
      new Request('https://yannis.dev/mcp', {
        method: 'POST',
        headers: {
          Accept: 'application/json, text/event-stream',
          'Content-Type': 'application/json',
          'MCP-Protocol-Version': LEGACY_PROTOCOL_VERSION,
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: { protocolVersion: LEGACY_PROTOCOL_VERSION, capabilities: {}, clientInfo: { name: 'test', version: '0' } },
        }),
      }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/json');
    expect(response.headers.get(API_VERSION_HEADER)).toBe(API_VERSION);
    expect(response.headers.get('RateLimit-Policy')).toContain('q=60');
    const body = (await response.json()) as { result: { serverInfo: { name: string } } };
    expect(body.result.serverInfo.name).toBe('dev.yannis/profile');
  });

  it('rejects non-http origins and allows GET to return 405', async () => {
    const forbidden = await handleMcpHttp(
      new Request('https://yannis.dev/mcp', {
        method: 'POST',
        headers: { Origin: 'file://evil' },
        body: '{}',
      }),
    );
    expect(forbidden.status).toBe(403);
    expect(forbidden.headers.get('Content-Type')).toContain('application/problem+json');
    expect((await forbidden.json()) as { code: string }).toMatchObject({ code: 'http.forbidden_origin' });

    const get = await handleMcpHttp(new Request('https://yannis.dev/mcp', { method: 'GET' }));
    expect(get.status).toBe(405);
    expect(get.headers.get('Allow')).toBe('POST, OPTIONS');
    expect(get.headers.get('Content-Type')).toContain('application/problem+json');
    expect((await get.json()) as { code: string }).toMatchObject({ code: 'http.method_not_allowed' });
  });

  it('returns the modern unsupported-version JSON-RPC error', async () => {
    const response = await handleMcpHttp(
      new Request('https://yannis.dev/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'MCP-Protocol-Version': '1900-01-01',
        },
        body: '{}',
      }),
    );
    expect(response.status).toBe(400);
    expect(response.headers.get('Content-Type')).toContain('application/json');
    expect((await response.json()) as { error: { code: number; data: { supported: string[] } } }).toMatchObject({
      error: {
        code: -32022,
        data: { supported: expect.arrayContaining(['2026-07-28']) },
      },
    });
  });

  it('answers a modern server/discover request with per-request metadata', async () => {
    const response = await handleMcpHttp(
      new Request('https://yannis.dev/mcp', {
        method: 'POST',
        headers: {
          Accept: 'application/json, text/event-stream',
          'Content-Type': 'application/json',
          'MCP-Protocol-Version': MCP_PROTOCOL_VERSION,
          'Mcp-Method': 'server/discover',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'discover-http',
          method: 'server/discover',
          params: {
            _meta: {
              'io.modelcontextprotocol/protocolVersion': MCP_PROTOCOL_VERSION,
              'io.modelcontextprotocol/clientInfo': { name: 'test', version: '1' },
              'io.modelcontextprotocol/clientCapabilities': {},
            },
          },
        }),
      }),
    );

    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      result: { _meta: { 'io.modelcontextprotocol/serverInfo': { name: string } } };
    };
    expect(body.result._meta['io.modelcontextprotocol/serverInfo'].name).toBe('dev.yannis/profile');
  });

  it('rejects mismatched modern request headers', async () => {
    const response = await handleMcpHttp(
      new Request('https://yannis.dev/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'MCP-Protocol-Version': MCP_PROTOCOL_VERSION,
          'Mcp-Method': 'tools/list',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 9,
          method: 'server/discover',
          params: { _meta: { 'io.modelcontextprotocol/protocolVersion': MCP_PROTOCOL_VERSION } },
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: { code: -32020 } });
  });

  it('returns HTTP 404 JSON-RPC for unknown modern methods', async () => {
    const response = await handleMcpHttp(
      new Request('https://yannis.dev/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'MCP-Protocol-Version': MCP_PROTOCOL_VERSION,
          'Mcp-Method': 'unknown/method',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 10,
          method: 'unknown/method',
          params: { _meta: { 'io.modelcontextprotocol/protocolVersion': MCP_PROTOCOL_VERSION } },
        }),
      }),
    );
    expect(response.status).toBe(404);
    expect(response.headers.get('Content-Type')).toContain('application/json');
    expect((await response.json()) as { error: { code: number } }).toMatchObject({
      error: { code: -32601 },
    });
  });
});

describe('MCP page route', () => {
  it('exposes GET on /mcp as 405', async () => {
    const get = await getMcp({ request: new Request('http://localhost:4321/mcp') } as never);
    expect(get.status).toBe(405);
    expect(get.headers.get('Content-Type')).toContain('application/problem+json');
  });
});

describe('MCP Vite connect middleware', () => {
  it('reads the Node POST body for initialize', async () => {
    const payload = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: { protocolVersion: LEGACY_PROTOCOL_VERSION, capabilities: {}, clientInfo: { name: 'test', version: '0' } },
    });
    const req = Readable.from([payload]) as import('node:http').IncomingMessage;
    req.method = 'POST';
    req.url = '/mcp';
    req.headers = {
      host: '127.0.0.1:4321',
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
    };

    const chunks: Buffer[] = [];
    const res = {
      statusCode: 0,
      setHeader() {},
      end(chunk?: Buffer) {
        if (chunk) chunks.push(chunk);
      },
    } as unknown as import('node:http').ServerResponse;

    await mcpDevConnectMiddleware()(req, res, (error) => {
      if (error) throw error;
    });

    const body = JSON.parse(Buffer.concat(chunks).toString()) as { result?: { serverInfo?: { name?: string } }; error?: unknown };
    expect(res.statusCode).toBe(200);
    expect(body.result?.serverInfo?.name).toBe('dev.yannis/profile');
  });
});
