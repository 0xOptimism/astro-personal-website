import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleMcpHttp } from './mcp';
import { MACHINE_PATHS } from './routes';

type NextFunction = (error?: unknown) => void;

export type ViteConnectServer = {
  middlewares: {
    stack: Array<{ route: string; handle: (req: IncomingMessage, res: ServerResponse, next: NextFunction) => void }>;
    use: (handler: (req: IncomingMessage, res: ServerResponse, next: NextFunction) => void) => void;
  };
};

function pathnameOf(url: string | undefined): string {
  const path = (url ?? '/').split('?')[0] ?? '/';
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

function readIncomingBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer | string) => {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

const HOP_BY_HOP_HEADERS = new Set(['connection', 'keep-alive', 'proxy-connection', 'transfer-encoding', 'upgrade', 'host']);

function incomingToFetchRequest(req: IncomingMessage, body: Buffer): Request {
  const host = typeof req.headers.host === 'string' && req.headers.host.length > 0 ? req.headers.host : '127.0.0.1:4321';
  const url = `http://${host}${req.url ?? MACHINE_PATHS.mcp}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined || HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(key, item);
      }
    } else {
      headers.set(key, value);
    }
  }

  const method = req.method ?? 'POST';
  return new Request(url, {
    method,
    headers,
    body: method === 'GET' || method === 'HEAD' ? undefined : new Uint8Array(body),
  });
}

async function writeFetchResponse(res: ServerResponse, response: Response): Promise<void> {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  res.end(Buffer.from(await response.arrayBuffer()));
}

export function mcpDevConnectMiddleware() {
  return async (req: IncomingMessage, res: ServerResponse, next: NextFunction) => {
    if (pathnameOf(req.url) !== MACHINE_PATHS.mcp || req.method === 'GET') {
      next();
      return;
    }

    try {
      const body = await readIncomingBody(req);
      const response = await handleMcpHttp(incomingToFetchRequest(req, body));
      await writeFetchResponse(res, response);
    } catch (error) {
      next(error);
    }
  };
}

export function attachMcpDevMiddleware(server: ViteConnectServer): void {
  server.middlewares.use(mcpDevConnectMiddleware());
  const layer = server.middlewares.stack.pop();
  if (layer) {
    server.middlewares.stack.unshift(layer);
  }
}
