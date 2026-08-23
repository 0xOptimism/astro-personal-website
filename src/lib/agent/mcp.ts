import {
  ABOUT_AGENTS,
  ABOUT_WORK,
  HERO_LEDE,
  KNOWS_ABOUT,
  SAME_AS,
  SITE_DESCRIPTION,
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
import { HTML_PAGES } from '../pages.ts';
import { pageMarkdown } from '../pages.ts';
import { homepageMarkdown } from './markdown.ts';
import { llmsFullTxt, llmsTxt } from './llms.ts';
import { openApiJson } from './openapi.ts';
import { MACHINE_PATHS, absoluteUrl } from './routes.ts';

const JSON_CONTENT_TYPE = 'application/json; charset=utf-8';
const MCP_PROTOCOL_VERSION = '2025-11-25';
const SUPPORTED_PROTOCOL_VERSIONS = new Set([MCP_PROTOCOL_VERSION, '2025-03-26']);

interface JsonRpcRequest {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
}

interface McpTool {
  name: string;
  title: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    additionalProperties: false;
  };
}

const tools: McpTool[] = [
  {
    name: 'get_yannis_profile',
    title: 'Get Yannis profile',
    description: 'Return a concise public profile for Yannis.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'get_yannis_contact',
    title: 'Get Yannis contact',
    description: 'Return public contact and social links.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'get_yannis_skills',
    title: 'Get Yannis skills',
    description: 'Return grouped public skills and tools.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'get_yannis_timeline',
    title: 'Get Yannis timeline',
    description: 'Return public career timeline entries.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'list_yannis_developer_resources',
    title: 'List Yannis developer resources',
    description: 'Return public HTML, Markdown, OpenAPI, llms.txt, and MCP resource URLs.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
];

function jsonResponse(body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': JSON_CONTENT_TYPE,
      'X-Content-Type-Options': 'nosniff',
      'Access-Control-Allow-Origin': '*',
      ...extraHeaders,
    },
  });
}

function responseResult(id: JsonRpcRequest['id'], result: unknown): Response {
  return jsonResponse({ jsonrpc: '2.0', id, result });
}

function responseError(id: JsonRpcRequest['id'], code: number, message: string): Response {
  return jsonResponse({ jsonrpc: '2.0', id: id ?? null, error: { code, message } });
}

function toolText(payload: unknown) {
  return {
    content: [
      {
        type: 'text',
        text: typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2),
      },
    ],
  };
}

function developerResources() {
  return [
    { title: 'Homepage', url: SITE_ORIGIN },
    { title: 'Homepage markdown', url: absoluteUrl(MACHINE_PATHS.homepageMarkdown) },
    { title: 'llms.txt', url: absoluteUrl(MACHINE_PATHS.llms) },
    { title: 'llms-full.txt', url: absoluteUrl(MACHINE_PATHS.llmsFull) },
    { title: 'OpenAPI', url: absoluteUrl(MACHINE_PATHS.openapi) },
    { title: 'MCP endpoint', url: absoluteUrl(MACHINE_PATHS.mcp) },
    { title: 'MCP server card', url: absoluteUrl(MACHINE_PATHS.mcpServerCard) },
    { title: 'MCP endpoint manifest', url: absoluteUrl(MACHINE_PATHS.mcpEndpointManifest) },
    ...HTML_PAGES.map((page) => ({ title: page.heading, url: absoluteUrl(page.path) })),
  ];
}

function mimeTypeForUrl(url: string): string {
  if (url.endsWith('.json')) return 'application/json';
  if (url.endsWith('.txt') || url.endsWith('.md')) return 'text/markdown';
  return 'text/html';
}

function resourceText(url: string): string | null {
  if (url === SITE_ORIGIN) return homepageMarkdown();
  if (url === absoluteUrl(MACHINE_PATHS.homepageMarkdown)) return homepageMarkdown();
  if (url === absoluteUrl(MACHINE_PATHS.llms)) return llmsTxt();
  if (url === absoluteUrl(MACHINE_PATHS.llmsFull)) return llmsFullTxt();
  if (url === absoluteUrl(MACHINE_PATHS.openapi)) return openApiJson();
  if (url === absoluteUrl(MACHINE_PATHS.mcpServerCard)) return JSON.stringify(mcpServerCard());
  if (url === absoluteUrl(MACHINE_PATHS.mcpEndpointManifest)) return JSON.stringify(mcpEndpointManifest());

  const page = HTML_PAGES.find((entry) => absoluteUrl(entry.path) === url);
  return page ? pageMarkdown(page) : null;
}

function profilePayload() {
  return {
    name: SITE_NAME,
    role: SITE_JOB_TITLE,
    location: SITE_LOCATION,
    employer: SITE_EMPLOYER,
    description: SITE_DESCRIPTION,
    summary: HERO_LEDE,
    work: ABOUT_WORK,
    agents: ABOUT_AGENTS,
  };
}

function contactPayload() {
  return {
    email: SITE_EMAIL,
    social: {
      linkedin: SAME_AS[0],
      github: SAME_AS[1],
    },
  };
}

function skillsPayload() {
  return {
    summary: skills.description,
    knowsAbout: KNOWS_ABOUT,
    groups: skills.groups,
    agenticWorkflow,
  };
}

function timelinePayload() {
  return timeline;
}

function callTool(name: unknown) {
  if (typeof name !== 'string') {
    return null;
  }

  if (name === 'get_yannis_profile') return toolText(profilePayload());
  if (name === 'get_yannis_contact') return toolText(contactPayload());
  if (name === 'get_yannis_skills') return toolText(skillsPayload());
  if (name === 'get_yannis_timeline') return toolText(timelinePayload());
  if (name === 'list_yannis_developer_resources') return toolText(developerResources());
  return null;
}

export function mcpServerCard() {
  return {
    schema_version: '1.0',
    name: `${SITE_NAME} MCP server`,
    description: `Public, read-only MCP server for ${SITE_NAME}'s profile, contact, skills, timeline, and developer resources.`,
    url: absoluteUrl(MACHINE_PATHS.mcp),
    protocol: 'mcp',
    transport: 'streamable-http',
    protocol_versions: [...SUPPORTED_PROTOCOL_VERSIONS],
    auth: { type: 'none' },
    endpoints: {
      mcp: absoluteUrl(MACHINE_PATHS.mcp),
      manifest: absoluteUrl(MACHINE_PATHS.mcpEndpointManifest),
      openapi: absoluteUrl(MACHINE_PATHS.openapi),
    },
    tools: tools.map(({ name, title, description }) => ({ name, title, description })),
  };
}

export function mcpEndpointManifest() {
  return {
    name: `${SITE_NAME} MCP endpoint manifest`,
    description: 'Public Streamable HTTP endpoint list for yannis.dev.',
    endpoints: [
      {
        type: 'mcp',
        transport: 'streamable-http',
        url: absoluteUrl(MACHINE_PATHS.mcp),
        methods: ['POST'],
        auth: { type: 'none' },
        protocol_versions: [...SUPPORTED_PROTOCOL_VERSIONS],
      },
    ],
  };
}

export function mcpOptionsResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'content-type, accept, mcp-protocol-version',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function mcpPostResponse(request: Request): Promise<Response> {
  let message: JsonRpcRequest;
  try {
    message = (await request.json()) as JsonRpcRequest;
  } catch {
    return responseError(null, -32700, 'Parse error');
  }

  if (message.jsonrpc !== '2.0' || typeof message.method !== 'string') {
    return responseError(message.id, -32600, 'Invalid Request');
  }

  if (message.id === undefined) {
    return new Response(null, {
      status: 202,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }

  if (message.method === 'initialize') {
    const requestedVersion =
      typeof message.params?.protocolVersion === 'string' ? message.params.protocolVersion : MCP_PROTOCOL_VERSION;
    const protocolVersion = SUPPORTED_PROTOCOL_VERSIONS.has(requestedVersion) ? requestedVersion : MCP_PROTOCOL_VERSION;
    return responseResult(message.id, {
      protocolVersion,
      capabilities: {
        tools: { listChanged: false },
        resources: { subscribe: false, listChanged: false },
        prompts: { listChanged: false },
      },
      serverInfo: {
        name: 'yannis-dev',
        title: `${SITE_NAME} MCP server`,
        version: '1.0.0',
      },
      instructions: `Use this server for public facts about ${SITE_NAME}. It has no write tools and requires no authentication.`,
    });
  }

  if (message.method === 'ping') {
    return responseResult(message.id, {});
  }

  if (message.method === 'tools/list') {
    return responseResult(message.id, { tools });
  }

  if (message.method === 'tools/call') {
    const result = callTool(message.params?.name);
    return result ? responseResult(message.id, result) : responseError(message.id, -32602, 'Unknown tool');
  }

  if (message.method === 'resources/list') {
    return responseResult(message.id, {
      resources: developerResources().map((resource) => ({
        uri: resource.url,
        name: resource.title,
        title: resource.title,
        description: `Public ${resource.title} resource on yannis.dev.`,
        mimeType: mimeTypeForUrl(resource.url),
      })),
    });
  }

  if (message.method === 'resources/read') {
    const uri = typeof message.params?.uri === 'string' ? message.params.uri : '';
    const resource = developerResources().find((entry) => entry.url === uri);
    const text = resource ? resourceText(resource.url) : null;
    if (!resource || text === null) {
      return responseError(message.id, -32602, 'Unknown resource');
    }

    return responseResult(message.id, {
      contents: [
        {
          uri: resource.url,
          mimeType: mimeTypeForUrl(resource.url),
          text,
        },
      ],
    });
  }

  if (message.method === 'prompts/list') {
    return responseResult(message.id, { prompts: [] });
  }

  return responseError(message.id, -32601, 'Method not found');
}
