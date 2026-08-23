import { mcpEndpointManifest } from '../../../lib/agent/mcp';
import { jsonPageRoute } from '../../../lib/agent/page-route';

export const GET = jsonPageRoute(mcpEndpointManifest);
