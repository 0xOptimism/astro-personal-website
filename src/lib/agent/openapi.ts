import { HTML_PAGES } from '../pages.ts';
import { SITE_DESCRIPTION, SITE_EMAIL, SITE_NAME, SITE_ORIGIN } from '../site.ts';
import { MACHINE_PATHS, absoluteUrl } from './routes.ts';
import {
  API_VERSION,
  API_VERSION_HEADER,
  RATE_LIMIT_POLICY_NAME,
  RATE_LIMIT_QUOTA,
  RATE_LIMIT_REMAINING,
  RATE_LIMIT_WINDOW_SECONDS,
} from './http.ts';

const API_VERSION_PARAMETER = { $ref: '#/components/parameters/ApiVersion' } as const;

const AGENT_RESPONSE_HEADERS = {
  [API_VERSION_HEADER]: { $ref: '#/components/headers/ApiVersion' },
  'RateLimit-Policy': { $ref: '#/components/headers/RateLimitPolicy' },
  RateLimit: { $ref: '#/components/headers/RateLimit' },
  'RateLimit-Limit': { $ref: '#/components/headers/RateLimitLimit' },
  'RateLimit-Remaining': { $ref: '#/components/headers/RateLimitRemaining' },
  'RateLimit-Reset': { $ref: '#/components/headers/RateLimitReset' },
  Sunset: { $ref: '#/components/headers/Sunset' },
} as const;

const RETRY_AFTER_HEADER = {
  'Retry-After': { $ref: '#/components/headers/RetryAfter' },
} as const;

const PROBLEM_JSON_CONTENT = {
  'application/problem+json': {
    schema: { $ref: '#/components/schemas/ProblemDetails' },
  },
} as const;

const HTML_RESPONSE = {
  '200': {
    description: 'HTML page',
    content: {
      'text/html': { schema: { type: 'string' } },
      'text/markdown': { schema: { type: 'string' } },
    },
  },
  '406': {
    description: 'The requested representation is not available.',
    content: {
      'application/problem+json': { schema: { $ref: '#/components/schemas/ProblemDetails' } },
      'text/plain': { schema: { type: 'string' } },
    },
  },
} as const;

const COMMON_ERROR_RESPONSES = {
  '400': {
    description: 'Bad request represented as RFC 9457 problem details.',
    headers: AGENT_RESPONSE_HEADERS,
    content: PROBLEM_JSON_CONTENT,
  },
  '404': {
    description: 'Not found represented as RFC 9457 problem details.',
    headers: AGENT_RESPONSE_HEADERS,
    content: PROBLEM_JSON_CONTENT,
  },
  '405': {
    description: 'Method not allowed represented as RFC 9457 problem details.',
    headers: AGENT_RESPONSE_HEADERS,
    content: PROBLEM_JSON_CONTENT,
  },
  '429': {
    description: 'Rate limit exceeded. Retry-After takes precedence over RateLimit hints.',
    headers: { ...AGENT_RESPONSE_HEADERS, ...RETRY_AFTER_HEADER },
    content: PROBLEM_JSON_CONTENT,
  },
  '500': {
    description: 'Unexpected server error represented as RFC 9457 problem details.',
    headers: AGENT_RESPONSE_HEADERS,
    content: PROBLEM_JSON_CONTENT,
  },
  default: {
    description: 'Error represented as RFC 9457 problem details.',
    headers: AGENT_RESPONSE_HEADERS,
    content: PROBLEM_JSON_CONTENT,
  },
} as const;

const FORBIDDEN_ERROR_RESPONSE = {
  description: 'Forbidden request represented as RFC 9457 problem details.',
  headers: AGENT_RESPONSE_HEADERS,
  content: PROBLEM_JSON_CONTENT,
} as const;

function markdownGet(operationId: string, summary: string, description: string) {
  return {
    get: {
      tags: ['agents'],
      operationId,
      summary,
      parameters: [API_VERSION_PARAMETER],
      responses: {
        '200': {
          description,
          headers: AGENT_RESPONSE_HEADERS,
          content: { 'text/markdown': { schema: { type: 'string' } } },
        },
        ...COMMON_ERROR_RESPONSES,
      },
    },
  };
}

function jsonGet(
  tag: string,
  operationId: string,
  summary: string,
  description: string,
  schema: Record<string, unknown> = { type: 'object' },
) {
  return {
    get: {
      tags: [tag],
      operationId,
      summary,
      parameters: [API_VERSION_PARAMETER],
      responses: {
        '200': {
          description,
          headers: AGENT_RESPONSE_HEADERS,
          content: { 'application/json': { schema } },
        },
        ...COMMON_ERROR_RESPONSES,
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
          parameters: [API_VERSION_PARAMETER],
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
      description: `${SITE_DESCRIPTION} This OpenAPI document lists the public Yannis developer resources: HTML trust pages, markdown twins, llms.txt, API status, MCP, and contact. API clients can pin version ${API_VERSION} with the ${API_VERSION_HEADER} header. No public endpoint is deprecated today; if a version is scheduled to retire, yannis.dev will document the replacement and send a Sunset response header at least 90 days before removal.`,
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
    'x-yannis-api-version': API_VERSION,
    'x-versioning-policy': `Current public API version is ${API_VERSION}. Clients may send ${API_VERSION_HEADER}: ${API_VERSION}; responses echo the active version.`,
    'x-deprecation-policy':
      'Breaking API versions remain available for at least 90 days after a documented Sunset date. No endpoint is deprecated today.',
    'x-rate-limit-policy': {
      policy: RATE_LIMIT_POLICY_NAME,
      quota: RATE_LIMIT_QUOTA,
      windowSeconds: RATE_LIMIT_WINDOW_SECONDS,
      remainingExample: RATE_LIMIT_REMAINING,
      headers: ['RateLimit-Policy', 'RateLimit', 'RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
    },
    tags: [
      { name: 'profile', description: 'Human-readable profile pages' },
      { name: 'agents', description: 'Machine-readable Yannis developer resources' },
      { name: 'status', description: 'Read-only API status and policy metadata' },
      { name: 'mcp', description: 'Model Context Protocol' },
    ],
    components: {
      parameters: {
        ApiVersion: {
          name: API_VERSION_HEADER,
          in: 'header',
          required: false,
          description: `Optional version pin for yannis.dev public API clients. Current supported value: ${API_VERSION}.`,
          schema: { type: 'string', enum: [API_VERSION] },
        },
      },
      headers: {
        ApiVersion: {
          description: `Current yannis.dev public API version. Clients may send the same value in ${API_VERSION_HEADER}.`,
          schema: { type: 'string', enum: [API_VERSION] },
        },
        RateLimitPolicy: {
          description: `Quota policy using IETF RateLimit syntax. Example: "${RATE_LIMIT_POLICY_NAME}";q=${RATE_LIMIT_QUOTA};w=${RATE_LIMIT_WINDOW_SECONDS}.`,
          schema: { type: 'string' },
        },
        RateLimit: {
          description: `Current quota hint using IETF RateLimit syntax. Example: "${RATE_LIMIT_POLICY_NAME}";r=${RATE_LIMIT_REMAINING};t=${RATE_LIMIT_WINDOW_SECONDS}.`,
          schema: { type: 'string' },
        },
        RateLimitLimit: {
          description: 'Compatibility header: maximum requests allowed in the window.',
          schema: { type: 'integer', minimum: 0, example: RATE_LIMIT_QUOTA },
        },
        RateLimitRemaining: {
          description: 'Compatibility header: remaining requests in the current window.',
          schema: { type: 'integer', minimum: 0, example: RATE_LIMIT_REMAINING },
        },
        RateLimitReset: {
          description: 'Compatibility header: seconds until the current window resets.',
          schema: { type: 'integer', minimum: 0, example: RATE_LIMIT_WINDOW_SECONDS },
        },
        RetryAfter: {
          description: 'Seconds to wait before retrying after HTTP 429.',
          schema: { type: 'integer', minimum: 0, example: RATE_LIMIT_WINDOW_SECONDS },
        },
        Sunset: {
          description: 'Present only when an endpoint or version has a scheduled retirement date. Value is an HTTP-date.',
          schema: { type: 'string', example: 'Wed, 31 Dec 2026 23:59:59 GMT' },
        },
      },
      schemas: {
        ProblemDetails: {
          type: 'object',
          description: 'RFC 9457 problem details with yannis.dev extension members for agents.',
          required: ['type', 'title', 'status', 'detail', 'instance', 'code', 'hint'],
          properties: {
            type: {
              type: 'string',
              format: 'uri-reference',
              description: 'Problem type URI. Dereferences to yannis.dev developer error docs.',
            },
            title: { type: 'string', description: 'Stable human-readable summary.' },
            status: { type: 'integer', minimum: 100, maximum: 599, description: 'HTTP status code.' },
            detail: { type: 'string', description: 'Occurrence-specific recovery detail.' },
            instance: { type: 'string', format: 'uri-reference', description: 'Path or URI for this occurrence.' },
            code: {
              type: 'string',
              description: 'Stable machine-readable code.',
              examples: ['api.not_found', 'http.method_not_allowed', 'rate_limit.exceeded'],
            },
            hint: { type: 'string', description: 'Actionable remediation hint for agents.' },
          },
          additionalProperties: true,
        },
        ApiStatus: {
          type: 'object',
          required: ['status', 'name', 'origin', 'apiVersion', 'resources', 'rateLimit', 'deprecation'],
          properties: {
            status: { type: 'string', const: 'ok' },
            name: { type: 'string' },
            origin: { type: 'string', format: 'uri' },
            apiVersion: { type: 'string', enum: [API_VERSION] },
            contact: { type: 'string', format: 'email' },
            resources: {
              type: 'object',
              additionalProperties: { type: 'string', format: 'uri' },
            },
            rateLimit: {
              type: 'object',
              required: ['policy', 'quota', 'windowSeconds', 'headers'],
              properties: {
                policy: { type: 'string', const: RATE_LIMIT_POLICY_NAME },
                quota: { type: 'integer', example: RATE_LIMIT_QUOTA },
                windowSeconds: { type: 'integer', example: RATE_LIMIT_WINDOW_SECONDS },
                headers: { type: 'array', items: { type: 'string' } },
              },
            },
            deprecation: {
              type: 'object',
              required: ['policy', 'currentVersion', 'deprecated'],
              properties: {
                policy: { type: 'string' },
                currentVersion: { type: 'string', enum: [API_VERSION] },
                deprecated: { type: 'boolean', const: false },
              },
            },
          },
        },
        JsonRpcRequest: {
          type: 'object',
          required: ['jsonrpc', 'method'],
          properties: {
            jsonrpc: { type: 'string', const: '2.0' },
            id: { oneOf: [{ type: 'string' }, { type: 'integer' }, { type: 'null' }] },
            method: { type: 'string' },
            params: { type: 'object' },
          },
          additionalProperties: true,
        },
        JsonRpcResponse: {
          type: 'object',
          required: ['jsonrpc'],
          properties: {
            jsonrpc: { type: 'string', const: '2.0' },
            id: { oneOf: [{ type: 'string' }, { type: 'integer' }, { type: 'null' }] },
            result: { type: 'object' },
            error: {
              type: 'object',
              required: ['code', 'message'],
              properties: {
                code: { type: 'integer' },
                message: { type: 'string' },
              },
            },
          },
          additionalProperties: true,
        },
      },
    },
    paths: {
      '/': {
        get: {
          tags: ['profile'],
          operationId: 'getHomepage',
          summary: `${SITE_NAME} homepage`,
          description: 'Server-rendered homepage with an H1 and full profile text.',
          parameters: [API_VERSION_PARAMETER],
          responses: HTML_RESPONSE,
        },
      },
      ...htmlPaths,
      [MACHINE_PATHS.homepageMarkdown]: markdownGet('getHomepageMarkdown', 'Homepage markdown twin', 'Markdown'),
      [MACHINE_PATHS.llms]: markdownGet('getLlmsTxt', 'llms.txt agent index', 'llms.txt'),
      [MACHINE_PATHS.llmsFull]: markdownGet('getLlmsFullTxt', 'Full llms.txt plus homepage markdown', 'llms-full.txt'),
      [MACHINE_PATHS.openapi]: jsonGet('agents', 'getOpenApi', `${SITE_NAME} OpenAPI spec`, 'OpenAPI 3.1 document'),
      [MACHINE_PATHS.apiStatus]: jsonGet(
        'status',
        'getApiStatus',
        `${SITE_NAME} API status`,
        'Read-only status, API version, rate-limit policy, and discovery links.',
        { $ref: '#/components/schemas/ApiStatus' },
      ),
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
          parameters: [API_VERSION_PARAMETER],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/JsonRpcRequest' },
              },
            },
          },
          responses: {
            '200': {
              description: 'JSON-RPC response',
              headers: AGENT_RESPONSE_HEADERS,
              content: { 'application/json': { schema: { $ref: '#/components/schemas/JsonRpcResponse' } } },
            },
            '202': {
              description: 'Notification accepted',
              headers: AGENT_RESPONSE_HEADERS,
            },
            '400': {
              description: 'Bad HTTP/MCP request represented either as problem details or a JSON-RPC error.',
              headers: AGENT_RESPONSE_HEADERS,
              content: {
                ...PROBLEM_JSON_CONTENT,
                'application/json': { schema: { $ref: '#/components/schemas/JsonRpcResponse' } },
              },
            },
            '403': FORBIDDEN_ERROR_RESPONSE,
            '405': COMMON_ERROR_RESPONSES['405'],
            '429': COMMON_ERROR_RESPONSES['429'],
            '500': COMMON_ERROR_RESPONSES['500'],
            default: COMMON_ERROR_RESPONSES.default,
          },
        },
      },
    },
  };
}

export function openApiJson(): string {
  return JSON.stringify(openApiSpec());
}
