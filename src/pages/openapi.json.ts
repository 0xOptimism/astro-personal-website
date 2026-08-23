import { openApiSpec } from '../lib/agent/openapi';
import { jsonPageRoute } from '../lib/agent/page-route';

export const GET = jsonPageRoute(openApiSpec);
