import { describe, expect, it } from 'vitest';
import { openApiSpec } from '../src/lib/agent/openapi';

describe('OpenAPI', () => {
  it('is OpenAPI 3.1 titled with Yannis developer resources', () => {
    const spec = openApiSpec();
    expect(spec.openapi).toBe('3.1.0');
    expect(spec.info).toMatchObject({
      title: 'Yannis developer resources API',
    });
    const paths = spec.paths as Record<string, unknown>;
    expect(paths['/openapi.json']).toBeTruthy();
    expect(paths['/mcp']).toBeTruthy();
    expect(paths['/about']).toBeTruthy();
    expect(paths['/developers']).toBeTruthy();
    expect(paths['/.well-known/mcp/server-card.json']).toBeTruthy();
    expect(paths['/.well-known/mcp/manifest.json']).toBeTruthy();
  });
});
