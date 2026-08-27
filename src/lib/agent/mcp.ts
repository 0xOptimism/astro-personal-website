import { HTML_PAGES } from '../pages.ts';
import {
  SAME_AS,
  SITE_DESCRIPTION,
  SITE_DOMAIN,
  SITE_EMAIL,
  SITE_EMPLOYER,
  SITE_JOB_TITLE,
  SITE_LOCATION,
  SITE_NAME,
  SITE_ORIGIN,
  agenticWorkflow,
  skills,
  timeline,
} from '../site.ts';
import {
  WRITING_INDEX,
  visibleWritingPosts,
  writingIndexMarkdown,
  writingMarkdownPath,
  writingPostMarkdown,
} from '../writing.ts';
import { homepageMarkdown } from './markdown.ts';
import { llmsTxt } from './llms.ts';
import { MACHINE_PATHS, absoluteUrl } from './routes.ts';
import {
  API_RESPONSE_HEADERS,
  API_VERSION_HEADER,
  EXPOSED_AGENT_HEADERS,
  apiStatusPayload,
  problemResponse,
} from './http.ts';
import { openApiJson } from './openapi.ts';

export const MCP_PROTOCOL_VERSION = '2026-07-28';
export const MCP_SUPPORTED_PROTOCOL_VERSIONS = ['2026-07-28', '2025-11-25', '2025-03-26'] as const;
export const MCP_SERVER_VERSION = '1.0.0';
export const MCP_SERVER_NAME = 'dev.yannis/profile';

const MCP_LEGACY_PROTOCOL_VERSION = '2025-11-25';
const MCP_LEGACY_PROTOCOL_VERSIONS: ReadonlySet<string> = new Set(['2025-11-25', '2025-03-26']);

const EMPTY_OBJECT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
} as const;

const READ_ONLY_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

export type JsonRpcId = string | number | null;

export interface JsonRpcRequest {
  jsonrpc?: unknown;
  id?: JsonRpcId;
  method?: unknown;
  params?: unknown;
}

const MCP_METHODS = [
  'initialize',
  'server/discover',
  'ping',
  'tools/list',
  'tools/call',
  'resources/list',
  'resources/read',
  'prompts/list',
  'notifications/initialized',
] as const;

type McpMethod = (typeof MCP_METHODS)[number];

const MCP_METHOD_SET: ReadonlySet<string> = new Set(MCP_METHODS);

function isMcpMethod(method: string): method is McpMethod {
  return MCP_METHOD_SET.has(method);
}

const SUPPORTED_PROTOCOL_VERSION_SET: ReadonlySet<string> = new Set(MCP_SUPPORTED_PROTOCOL_VERSIONS);

function isSupportedProtocolVersion(
  value: string,
): value is (typeof MCP_SUPPORTED_PROTOCOL_VERSIONS)[number] {
  return SUPPORTED_PROTOCOL_VERSION_SET.has(value);
}

function toolText(payload: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload,
    isError: false,
  };
}

const TOOLS = {
  get_yannis_profile: {
    title: 'Get Yannis profile',
    description: `Return the public profile for ${SITE_NAME}, full-stack developer at ${SITE_DOMAIN}.`,
    run: () =>
      toolText({
        name: SITE_NAME,
        brand: SITE_DOMAIN,
        url: SITE_ORIGIN,
        jobTitle: SITE_JOB_TITLE,
        employer: SITE_EMPLOYER,
        location: SITE_LOCATION,
        country: 'Sweden',
        description: SITE_DESCRIPTION,
      }),
  },
  get_yannis_contact: {
    title: 'Get Yannis contact',
    description: `Return public contact details for ${SITE_NAME}, including email and profile URLs.`,
    run: () =>
      toolText({
        name: SITE_NAME,
        email: SITE_EMAIL,
        url: SITE_ORIGIN,
        contactPage: absoluteUrl('/contact'),
        linkedIn: SAME_AS[0],
        github: SAME_AS[1],
      }),
  },
  get_yannis_skills: {
    title: 'Get Yannis skills',
    description: `Return the public engineering stack for ${SITE_NAME}.`,
    run: () =>
      toolText({
        title: skills.title,
        description: skills.description,
        groups: skills.groups.map((group: { title: string; items: { name: string }[] }) => ({
          title: group.title,
          items: group.items.map((item) => item.name),
        })),
        workflow: {
          title: agenticWorkflow.title,
          tools: agenticWorkflow.tools.map((tool: { name: string; role: string }) => ({
            name: tool.name,
            role: tool.role,
          })),
        },
      }),
  },
  get_yannis_timeline: {
    title: 'Get Yannis timeline',
    description: `Return the public career timeline for ${SITE_NAME}.`,
    run: () =>
      toolText({
        title: timeline.title,
        description: timeline.description,
        years: timeline.years,
      }),
  },
  list_yannis_developer_resources: {
    title: 'List Yannis developer resources',
    description: 'List OpenAPI, auth docs, webhooks docs, MCP, and llms.txt URLs for yannis.dev.',
    run: () =>
      toolText({
        product: `${SITE_NAME} developer resources`,
        pages: HTML_PAGES.filter((page) => page.path.startsWith('/developers')).map((page) => ({
          title: page.heading,
          url: absoluteUrl(page.path),
        })),
        openapi: absoluteUrl(MACHINE_PATHS.openapi),
        apiStatus: absoluteUrl(MACHINE_PATHS.apiStatus),
        mcp: absoluteUrl(MACHINE_PATHS.mcp),
        manifests: {
          serverCard: absoluteUrl(MACHINE_PATHS.mcpServerCard),
          endpointManifest: absoluteUrl(MACHINE_PATHS.mcpEndpointManifest),
        },
        llms: absoluteUrl(MACHINE_PATHS.llms),
        policies: {
          errors: absoluteUrl('/developers/errors'),
          versioning: absoluteUrl('/developers/versioning'),
          rateLimits: absoluteUrl('/developers/rate-limits'),
        },
      }),
  },
};

type ToolName = keyof typeof TOOLS;

export interface McpToolDefinition {
  name: ToolName;
  title: string;
  description: string;
  inputSchema: typeof EMPTY_OBJECT_SCHEMA;
  annotations: typeof READ_ONLY_ANNOTATIONS;
}

export const MCP_TOOLS: readonly McpToolDefinition[] = (Object.keys(TOOLS) as ToolName[]).map((name) => ({
  name,
  title: TOOLS[name].title,
  description: TOOLS[name].description,
  inputSchema: EMPTY_OBJECT_SCHEMA,
  annotations: READ_ONLY_ANNOTATIONS,
}));

function isToolName(name: string): name is ToolName {
  return Object.hasOwn(TOOLS, name);
}

export interface McpResourceDefinition {
  uri: string;
  name: string;
  title: string;
  description: string;
  mimeType: string;
  text: () => string;
}

export const MCP_RESOURCES: readonly McpResourceDefinition[] = [
  {
    uri: absoluteUrl(MACHINE_PATHS.homepageMarkdown),
    name: 'index.md',
    title: `${SITE_NAME} homepage markdown`,
    description: 'Markdown twin of the yannis.dev homepage.',
    mimeType: 'text/markdown',
    text: homepageMarkdown,
  },
  {
    uri: absoluteUrl(MACHINE_PATHS.llms),
    name: 'llms.txt',
    title: `${SITE_NAME} llms.txt`,
    description: 'Agent index for yannis.dev.',
    mimeType: 'text/markdown',
    text: llmsTxt,
  },
  {
    uri: absoluteUrl(WRITING_INDEX.markdownPath),
    name: 'posts.md',
    title: WRITING_INDEX.title,
    description: WRITING_INDEX.description,
    mimeType: 'text/markdown',
    text: writingIndexMarkdown,
  },
  ...visibleWritingPosts().map((post) => ({
    uri: absoluteUrl(writingMarkdownPath(post.id)),
    name: `${post.id}.md`,
    title: post.title,
    description: post.description,
    mimeType: 'text/markdown',
    text: () => writingPostMarkdown(post),
  })),
  {
    uri: absoluteUrl(MACHINE_PATHS.openapi),
    name: 'openapi.json',
    title: `${SITE_NAME} OpenAPI`,
    description: 'OpenAPI 3.1 contract for yannis.dev developer resources.',
    mimeType: 'application/json',
    text: openApiJson,
  },
  {
    uri: absoluteUrl(MACHINE_PATHS.apiStatus),
    name: 'api-status.json',
    title: `${SITE_NAME} API status`,
    description: 'Current public API version, rate-limit policy, and discovery links.',
    mimeType: 'application/json',
    text: () => JSON.stringify(apiStatusPayload(), null, 2),
  },
];

export function mcpServerInfo() {
  return {
    name: MCP_SERVER_NAME,
    title: `${SITE_NAME} MCP server`,
    version: MCP_SERVER_VERSION,
    description: `${SITE_DESCRIPTION} Public read-only tools and resources for profile, writing, contact, skills, timeline, and developer resources.`,
    websiteUrl: absoluteUrl('/developers/mcp'),
  };
}

export function mcpCapabilities() {
  return {
    tools: { listChanged: false },
    resources: { subscribe: false, listChanged: false },
    prompts: { listChanged: false },
  };
}

function resourceDescriptors() {
  return MCP_RESOURCES.map(({ uri, name, title, description, mimeType }) => ({
    uri,
    name,
    title,
    description,
    mimeType,
  }));
}

export function mcpServerCard() {
  const serverInfo = mcpServerInfo();
  const endpointUrl = absoluteUrl(MACHINE_PATHS.mcp);

  return {
    $schema: 'https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json',
    name: serverInfo.name,
    title: serverInfo.title,
    description: 'Read-only profile, writing, contact, skills, timeline, and developer resources for Yannis.',
    version: serverInfo.version,
    websiteUrl: serverInfo.websiteUrl,
    remotes: [
      {
        type: 'streamable-http',
        url: endpointUrl,
        supportedProtocolVersions: MCP_SUPPORTED_PROTOCOL_VERSIONS,
      },
    ],
  };
}

export function mcpEndpointManifest() {
  return {
    mcp_version: MCP_PROTOCOL_VERSION,
    endpoints: [
      {
        url: absoluteUrl(MACHINE_PATHS.mcp),
        transport: 'streamable-http',
        capabilities: ['tools', 'resources', 'prompts'],
        auth: { type: 'none' },
      },
    ],
  };
}

function jsonRpcError(id: JsonRpcId, code: number, message: string, data?: unknown) {
  return {
    jsonrpc: '2.0' as const,
    id,
    error: data === undefined ? { code, message } : { code, message, data },
  };
}

function jsonRpcResult(id: JsonRpcId, result: unknown) {
  return {
    jsonrpc: '2.0' as const,
    id,
    result,
  };
}

function readString(params: unknown, key: string): string | undefined {
  if (!params || typeof params !== 'object') {
    return undefined;
  }
  const value = (params as Record<string, unknown>)[key];
  return value === undefined || value === null ? undefined : String(value);
}

function modernProtocolVersion(message: JsonRpcRequest): string | undefined {
  if (!message.params || typeof message.params !== 'object') {
    return undefined;
  }
  const meta = (message.params as Record<string, unknown>)._meta;
  return readString(meta, 'io.modelcontextprotocol/protocolVersion');
}

function mirroredName(message: JsonRpcRequest): string | undefined {
  if (message.method === 'resources/read') {
    return readString(message.params, 'uri');
  }
  if (message.method === 'tools/call' || message.method === 'prompts/get') {
    return readString(message.params, 'name');
  }
  return undefined;
}

function handleMethod(method: McpMethod, id: JsonRpcId, params: unknown): { status: number; body: unknown | null } {
  switch (method) {
    case 'notifications/initialized':
      return { status: 202, body: null };
    case 'initialize': {
      const requested = readString(params, 'protocolVersion') ?? MCP_LEGACY_PROTOCOL_VERSION;
      const protocolVersion = MCP_LEGACY_PROTOCOL_VERSIONS.has(requested)
        ? requested
        : MCP_LEGACY_PROTOCOL_VERSION;
      return {
        status: 200,
        body: jsonRpcResult(id, {
          protocolVersion,
          capabilities: mcpCapabilities(),
          serverInfo: mcpServerInfo(),
          instructions: `Public read-only MCP server for ${SITE_NAME} at ${SITE_DOMAIN}.`,
        }),
      };
    }
    case 'server/discover':
      return {
        status: 200,
        body: jsonRpcResult(id, {
          resultType: 'complete',
          supportedVersions: MCP_SUPPORTED_PROTOCOL_VERSIONS,
          capabilities: mcpCapabilities(),
          _meta: {
            'io.modelcontextprotocol/serverInfo': mcpServerInfo(),
          },
          instructions: `Public read-only MCP server for ${SITE_NAME} at ${SITE_DOMAIN}. Use tools/list, resources/list, and list_yannis_developer_resources to discover the published profile resources.`,
          cacheScope: 'public',
          ttlMs: 3600000,
        }),
      };
    case 'ping':
      return { status: 200, body: jsonRpcResult(id, {}) };
    case 'tools/list':
      return { status: 200, body: jsonRpcResult(id, { tools: MCP_TOOLS }) };
    case 'tools/call': {
      const name = readString(params, 'name') ?? '';
      if (!isToolName(name)) {
        return { status: 200, body: jsonRpcError(id, -32602, `Unknown tool: ${name || '(missing)'}`) };
      }
      return { status: 200, body: jsonRpcResult(id, TOOLS[name].run()) };
    }
    case 'resources/list':
      return {
        status: 200,
        body: jsonRpcResult(id, {
          resources: resourceDescriptors(),
        }),
      };
    case 'resources/read': {
      const uri = readString(params, 'uri') ?? '';
      const resource = MCP_RESOURCES.find((entry) => entry.uri === uri);
      if (!resource) {
        return { status: 200, body: jsonRpcError(id, -32002, `Resource not found: ${uri}`) };
      }
      return {
        status: 200,
        body: jsonRpcResult(id, {
          contents: [
            {
              uri: resource.uri,
              mimeType: resource.mimeType,
              text: resource.text(),
            },
          ],
        }),
      };
    }
    case 'prompts/list':
      return { status: 200, body: jsonRpcResult(id, { prompts: [] }) };
    default: {
      const _exhaustive: never = method;
      return _exhaustive;
    }
  }
}

export function handleJsonRpc(message: JsonRpcRequest): { status: number; body: unknown | null } {
  if (message.jsonrpc !== '2.0' || typeof message.method !== 'string') {
    return { status: 400, body: jsonRpcError(message.id ?? null, -32600, 'Invalid Request') };
  }

  const id = message.id ?? null;
  if (!isMcpMethod(message.method)) {
    return { status: 404, body: jsonRpcError(id, -32601, `Method not found: ${message.method}`) };
  }

  if (message.method.startsWith('notifications/') && message.id !== undefined) {
    return { status: 400, body: jsonRpcError(id, -32600, 'Notifications must not include an id') };
  }

  return handleMethod(message.method, id, message.params);
}

function isHttpOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function corsHeaders(origin?: string | null): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin && isHttpOrigin(origin) ? origin : '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers':
      `Content-Type, Accept, ${API_VERSION_HEADER}, MCP-Protocol-Version, Mcp-Protocol-Version, MCP-Session-Id, Mcp-Session-Id, Mcp-Method, Mcp-Name`,
    'Access-Control-Expose-Headers': EXPOSED_AGENT_HEADERS,
    'Access-Control-Max-Age': '86400',
    ...API_RESPONSE_HEADERS,
  };
}

export function mcpMethodNotAllowed(origin?: string | null): Response {
  return problemResponse(
    {
      status: 405,
      title: 'Method not allowed',
      detail: 'The MCP Streamable HTTP endpoint accepts POST requests and OPTIONS preflight requests.',
      instance: MACHINE_PATHS.mcp,
      code: 'http.method_not_allowed',
      hint: `POST JSON-RPC to ${MACHINE_PATHS.mcp} or read ${absoluteUrl('/developers/mcp')}.`,
    },
    {
      Allow: 'POST, OPTIONS',
      ...corsHeaders(origin),
    },
  );
}

function mcpJsonResponse(body: unknown, status: number, origin?: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders(origin) },
  });
}

export async function handleMcpHttp(request: Request): Promise<Response> {
  const origin = request.headers.get('Origin');
  if (origin && !isHttpOrigin(origin)) {
    return problemResponse(
      {
        status: 403,
        title: 'Forbidden origin',
        detail: 'The Origin header must be an http or https origin.',
        instance: MACHINE_PATHS.mcp,
        code: 'http.forbidden_origin',
        hint: 'Retry from an http or https client origin, or omit Origin for a server-to-server request.',
      },
      corsHeaders(origin),
    );
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (request.method === 'GET' || request.method === 'DELETE') {
    return mcpMethodNotAllowed(origin);
  }

  if (request.method !== 'POST') {
    return mcpMethodNotAllowed(origin);
  }

  let message: JsonRpcRequest;
  try {
    const raw = await request.text();
    message = JSON.parse(raw) as JsonRpcRequest;
  } catch {
    return mcpJsonResponse(jsonRpcError(null, -32700, 'Parse error'), 400, origin);
  }

  const id = message.id ?? null;
  const headerProtocolVersion = request.headers.get('MCP-Protocol-Version');
  const bodyProtocolVersion = modernProtocolVersion(message);
  const unsupportedProtocolVersion = [headerProtocolVersion, bodyProtocolVersion].find(
    (version) => version && !isSupportedProtocolVersion(version),
  );
  if (unsupportedProtocolVersion) {
    return mcpJsonResponse(
      jsonRpcError(id, -32022, 'Unsupported protocol version', {
        supported: MCP_SUPPORTED_PROTOCOL_VERSIONS,
        requested: unsupportedProtocolVersion,
      }),
      400,
      origin,
    );
  }

  const isModernRequest =
    headerProtocolVersion === MCP_PROTOCOL_VERSION || bodyProtocolVersion === MCP_PROTOCOL_VERSION;
  if (isModernRequest) {
    const methodHeader = request.headers.get('Mcp-Method');
    const expectedName = mirroredName(message);
    const nameHeader = request.headers.get('Mcp-Name');
    const mismatch =
      headerProtocolVersion !== bodyProtocolVersion ||
      methodHeader !== message.method ||
      (expectedName !== undefined && nameHeader !== expectedName);

    if (mismatch) {
      return mcpJsonResponse(
        jsonRpcError(id, -32020, 'Header mismatch: MCP request headers do not match the JSON-RPC body'),
        400,
        origin,
      );
    }
  }

  const { status, body } = handleJsonRpc(message);
  if (body === null) {
    return new Response(null, { status, headers: corsHeaders(origin) });
  }

  return mcpJsonResponse(body, status, origin);
}
