import { apiStatusPayload } from '../../lib/agent/http';
import { jsonPageRoute } from '../../lib/agent/page-route';

export const GET = jsonPageRoute(apiStatusPayload);
