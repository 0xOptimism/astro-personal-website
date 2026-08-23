import { HTML_PAGES } from '../pages';
import { SITE_DESCRIPTION, SITE_EMAIL, SITE_NAME, SITE_ORIGIN } from '../site';
import { MACHINE_PATHS, absoluteUrl } from './routes';

const HTML_RESPONSE = {
  '200': {
    description: 'HTML page',
    content: {
      'text/html': { schema: { type: 'string' } },
      'text/markdown': { schema: { type: 'string' } },
    },
  },
} as const;

function markdownGet(operationId: string, summary: string, description: string) {
  return {
    get: {
      tags: ['agents'],
      operationId,
      summary,
      responses: {
        '200': {
          description,
          content: { 'text/markdown': { schema: { type: 'string' } } },
        },
      },
    },
  };
}

function jsonGet(tag: string, operationId: string, summary: string, description: string) {
  return {
    get: {
      tags: [tag],
      operationId,
      summary,
      responses: {
        '200': {
          description,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
      },
    },
  };
}

export function openApiSpec() {
  const htmlPaths = Object.fromEntries(
    HTML_PAGES.map((page) => [
      page.path,
      {
        get: {
          operationId: `get${page.path.replace(/[^a-zA-Z0-9]+/g, '_')}`,
          summary: page.heading,
          description: page.description,
          responses: HTML_RESPONSE,
        },
      },
    ]),
  );

  return {
    openapi: '3.1.0',
    info: {
      title: `${SITE_NAME} developer resources API`,
      summary: `Public read API for ${SITE_NAME} on yannis.dev`,
      description: `${SITE_DESCRIPTION} This OpenAPI document lists the public Yannis developer resources: HTML trust pages, markdown twins, llms.txt, MCP, and contact.`,
      version: '1.0.0',
      contact: {
        name: SITE_NAME,
        email: SITE_EMAIL,
        url: SITE_ORIGIN,
      },
      license: {
        name: 'Personal site content',
        url: absoluteUrl('/privacy'),
      },
    },
    servers: [{ url: SITE_ORIGIN, description: `${SITE_NAME} canonical origin` }],
    tags: [
      { name: 'profile', description: 'Human-readable profile pages' },
      { name: 'agents', description: 'Machine-readable Yannis developer resources' },
      { name: 'mcp', description: 'Model Context Protocol' },
    ],
    paths: {
      '/': {
        get: {
          tags: ['profile'],
          operationId: 'getHomepage',
          summary: `${SITE_NAME} homepage`,
          description: 'Server-rendered homepage with an H1 and full profile text.',
          responses: HTML_RESPONSE,
        },
      },
      ...htmlPaths,
      [MACHINE_PATHS.homepageMarkdown]: markdownGet('getHomepageMarkdown', 'Homepage markdown twin', 'Markdown'),
      [MACHINE_PATHS.llms]: markdownGet('getLlmsTxt', 'llms.txt agent index', 'llms.txt'),
      [MACHINE_PATHS.llmsFull]: markdownGet('getLlmsFullTxt', 'Full llms.txt plus homepage markdown', 'llms-full.txt'),
      [MACHINE_PATHS.openapi]: jsonGet('agents', 'getOpenApi', `${SITE_NAME} OpenAPI spec`, 'OpenAPI 3.1 document'),
      [MACHINE_PATHS.mcpServerCard]: jsonGet('mcp', 'getMcpServerCard', 'MCP server card', 'SEP-1649 server card'),
      [MACHINE_PATHS.mcpEndpointManifest]: jsonGet(
        'mcp',
        'getMcpEndpointManifest',
        'MCP endpoint manifest',
        'Endpoint list',
      ),
      [MACHINE_PATHS.mcp]: {
        post: {
          tags: ['mcp'],
          operationId: 'postMcp',
          summary: `${SITE_NAME} MCP Streamable HTTP endpoint`,
          description: 'JSON-RPC 2.0 MCP messages. Public, read-only tools.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['jsonrpc', 'method'],
                  properties: {
                    jsonrpc: { type: 'string', const: '2.0' },
                    id: { oneOf: [{ type: 'string' }, { type: 'integer' }] },
                    method: { type: 'string' },
                    params: { type: 'object' },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'JSON-RPC response',
              content: { 'application/json': { schema: { type: 'object' } } },
            },
            '202': { description: 'Notification accepted' },
          },
        },
      },
    },
  };
}

export function openApiJson(): string {
  return JSON.stringify(openApiSpec());
}
