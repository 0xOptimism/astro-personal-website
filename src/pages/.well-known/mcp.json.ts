import { mcpServerCard } from '../../lib/agent/mcp';
import { MCP_SERVER_CARD_CONTENT_TYPE } from '../../lib/agent/http';
import { jsonPageRoute } from '../../lib/agent/page-route';

export const GET = jsonPageRoute(mcpServerCard, {
  contentType: MCP_SERVER_CARD_CONTENT_TYPE,
  includeApiHeaders: false,
  headers: {
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type, If-None-Match',
    'Access-Control-Expose-Headers': 'ETag',
  },
});
