import { markdownBodyRoute } from '../lib/agent/page-route';
import { writingIndexMarkdown } from '../lib/writing';

export const GET = markdownBodyRoute(writingIndexMarkdown);
