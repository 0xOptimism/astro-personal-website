import { handleMcpHttp } from '../../src/lib/agent/mcp.ts';

export default async function handler(request: Request) {
  return handleMcpHttp(request);
}

export const config = { path: '/mcp' };
