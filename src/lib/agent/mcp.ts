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

export const MCP_PROTOCOL_VERSION = '2025-11-25';
export const MCP_SUPPORTED_PROTOCOL_VERSIONS = ['2025-11-25', '2025-03-26'] as const;
export const MCP_SERVER_VERSION = '1.0.0';
export const MCP_SERVER_NAME = 'yannis-dev';

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
    description: `${SITE_DESCRIPTION} Public read-only tools for profile, contact, skills, timeline, and developer resources.`,
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
  return {
    $schema: 'https://static.modelcontextprotocol.io/schemas/mcp-server-card/v1.json',
    version: '1.0',
    protocolVersion: MCP_PROTOCOL_VERSION,
    serverInfo: mcpServerInfo(),
    transport: {
      type: 'streamable-http',
      endpoint: MACHINE_PATHS.mcp,
    },
    capabilities: mcpCapabilities(),
    authentication: {
      required: false,
      schemes: [],
    },
    instructions: `Use this server for facts about ${SITE_NAME} (${SITE_DOMAIN}). All tools are read-only. Prefer get_yannis_profile first.`,
    tools: MCP_TOOLS,
    resources: resourceDescriptors(),
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

function jsonRpcError(id: JsonRpcId, code: number, message: string) {
  return {
    jsonrpc: '2.0' as const,
    id,
    error: { code, message },
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

function handleMethod(method: McpMethod, id: JsonRpcId, params: unknown): { status: number; body: unknown | null } {
  switch (method) {
    case 'notifications/initialized':
      return { status: 202, body: null };
    case 'initialize': {
      const requested = readString(params, 'protocolVersion') ?? MCP_PROTOCOL_VERSION;
      const protocolVersion = isSupportedProtocolVersion(requested) ? requested : MCP_PROTOCOL_VERSION;
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
    return { status: 200, body: jsonRpcError(id, -32601, `Method not found: ${message.method}`) };
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

  const protocolVersion = request.headers.get('MCP-Protocol-Version') ?? request.headers.get('Mcp-Protocol-Version');
  if (protocolVersion && !isSupportedProtocolVersion(protocolVersion)) {
    return problemResponse(
      {
        status: 400,
        title: 'Unsupported MCP protocol version',
        detail: `MCP-Protocol-Version ${protocolVersion} is not supported by this server.`,
        instance: MACHINE_PATHS.mcp,
        code: 'mcp.unsupported_protocol_version',
        hint: `Use one of: ${MCP_SUPPORTED_PROTOCOL_VERSIONS.join(', ')}.`,
      },
      corsHeaders(origin),
    );
  }

  let message: JsonRpcRequest;
  try {
    const raw = await request.text();
    message = JSON.parse(raw) as JsonRpcRequest;
  } catch {
    return new Response(JSON.stringify(jsonRpcError(null, -32700, 'Parse error')), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders(origin) },
    });
  }

  const { status, body } = handleJsonRpc(message);
  if (body === null) {
    return new Response(null, { status, headers: corsHeaders(origin) });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders(origin),
    },
  });
}
