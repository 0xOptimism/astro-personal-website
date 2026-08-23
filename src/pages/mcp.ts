import type { APIRoute } from 'astro';
import { mcpMethodNotAllowed } from '../lib/agent/mcp';

export const GET: APIRoute = async () => mcpMethodNotAllowed();
