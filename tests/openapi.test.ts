import { describe, expect, it } from 'vitest';
import { openApiSpec } from '../src/lib/agent/openapi';
import { API_VERSION, API_VERSION_HEADER } from '../src/lib/agent/http';

describe('OpenAPI', () => {
  it('is OpenAPI 3.1 titled with Yannis developer resources', () => {
    const spec = openApiSpec();
    expect(spec.openapi).toBe('3.1.0');
    expect(spec.info).toMatchObject({
      title: 'Yannis developer resources API',
    });
    const paths = spec.paths as Record<string, unknown>;
    expect(paths['/openapi.json']).toBeTruthy();
    expect(paths['/api/status.json']).toBeTruthy();
    expect(paths['/mcp']).toBeTruthy();
    expect(paths['/about']).toBeTruthy();
    expect(paths['/developers']).toBeTruthy();
    expect(paths['/developers/errors']).toBeTruthy();
    expect(paths['/developers/versioning']).toBeTruthy();
    expect(paths['/developers/rate-limits']).toBeTruthy();
    expect(paths['/.well-known/mcp/server-card.json']).toBeTruthy();
    expect(paths['/.well-known/mcp/manifest.json']).toBeTruthy();
  });

  it('documents a typed RFC 9457 error model', () => {
    const spec = openApiSpec() as {
      components: { schemas: Record<string, { required?: string[]; properties?: Record<string, unknown> }> };
      paths: Record<string, { post?: { responses: Record<string, { content?: Record<string, unknown> }> } }>;
    };

    expect(spec.components.schemas.ProblemDetails.required).toEqual(
      expect.arrayContaining(['type', 'title', 'status', 'detail', 'instance', 'code', 'hint']),
    );
    expect(spec.components.schemas.ProblemDetails.properties?.code).toBeTruthy();
    expect(spec.paths['/mcp']?.post?.responses['405'].content?.['application/problem+json']).toBeTruthy();
    expect(JSON.stringify(spec)).toContain('application/problem+json');
  });

  it('documents versioning, deprecation, and rate-limit headers', () => {
    const spec = openApiSpec() as {
      components: {
        parameters: Record<string, { name: string; schema: { enum: string[] } }>;
        headers: Record<string, unknown>;
      };
      paths: Record<string, { get?: { parameters?: unknown[]; responses: Record<string, { headers?: Record<string, unknown> }> } }>;
      'x-yannis-api-version': string;
      'x-deprecation-policy': string;
    };

    expect(spec['x-yannis-api-version']).toBe(API_VERSION);
    expect(spec['x-deprecation-policy']).toContain('90 days');
    expect(spec.components.parameters.ApiVersion.name).toBe(API_VERSION_HEADER);
    expect(spec.components.parameters.ApiVersion.schema.enum).toEqual([API_VERSION]);
    expect(spec.components.headers).toMatchObject({
      ApiVersion: expect.any(Object),
      RateLimit: expect.any(Object),
      RateLimitPolicy: expect.any(Object),
      RetryAfter: expect.any(Object),
      Sunset: expect.any(Object),
    });
    expect(spec.paths['/api/status.json']?.get?.parameters).toEqual([
      { $ref: '#/components/parameters/ApiVersion' },
    ]);
    expect(spec.paths['/api/status.json']?.get?.responses['200'].headers).toMatchObject({
      [API_VERSION_HEADER]: { $ref: '#/components/headers/ApiVersion' },
      RateLimit: { $ref: '#/components/headers/RateLimit' },
      'RateLimit-Policy': { $ref: '#/components/headers/RateLimitPolicy' },
    });
  });
});
