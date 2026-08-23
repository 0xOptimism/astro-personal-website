import { Readable } from 'node:stream';
import { describe, expect, it } from 'vitest';
import {
  MCP_PROTOCOL_VERSION,
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

describe('MCP manifests', () => {
  it('publishes a Streamable HTTP server card', () => {
    const card = mcpServerCard();
    expect(card.protocolVersion).toBe(MCP_PROTOCOL_VERSION);
    expect(card.transport).toEqual({ type: 'streamable-http', endpoint: '/mcp' });
    expect(card.serverInfo).toMatchObject({ name: 'yannis-dev', title: `${SITE_NAME} MCP server` });
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
      params: { protocolVersion: MCP_PROTOCOL_VERSION, capabilities: {}, clientInfo: { name: 'test', version: '1' } },
    });
    expect(response.status).toBe(200);
    const body = response.body as { result: { protocolVersion: string; capabilities: { tools: unknown } } };
    expect(body.result.protocolVersion).toBe(MCP_PROTOCOL_VERSION);
    expect(body.result.capabilities.tools).toBeTruthy();
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
          'MCP-Protocol-Version': MCP_PROTOCOL_VERSION,
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: { protocolVersion: MCP_PROTOCOL_VERSION, capabilities: {}, clientInfo: { name: 'test', version: '0' } },
        }),
      }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/json');
    expect(response.headers.get(API_VERSION_HEADER)).toBe(API_VERSION);
    expect(response.headers.get('RateLimit-Policy')).toContain('q=60');
    const body = (await response.json()) as { result: { serverInfo: { name: string } } };
    expect(body.result.serverInfo.name).toBe('yannis-dev');
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

  it('returns problem JSON for unsupported MCP protocol versions', async () => {
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
    expect(response.headers.get('Content-Type')).toContain('application/problem+json');
    expect((await response.json()) as { code: string }).toMatchObject({
      code: 'mcp.unsupported_protocol_version',
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
      params: { protocolVersion: MCP_PROTOCOL_VERSION, capabilities: {}, clientInfo: { name: 'test', version: '0' } },
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
    expect(body.result?.serverInfo?.name).toBe('yannis-dev');
  });
});
