import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@tailwindcss/vite';
import { attachMcpDevMiddleware } from './src/lib/agent/mcp-dev-middleware';

export default defineConfig({
  site: 'https://yannis.dev',
  compressHTML: true,
  build: {
    inlineStylesheets: 'always',
  },
  integrations: [
    react(),
    {
      name: 'yannis-mcp-dev',
      hooks: {
        'astro:server:setup'({ server }) {
          attachMcpDevMiddleware(server);
        },
      },
    },
  ],
  vite: {
    plugins: [tailwind()],
  },
  redirects: {
    '/docs': '/developers',
    '/docs/auth': '/developers/auth',
    '/docs/mcp': '/developers/mcp',
    '/docs/webhooks': '/developers/webhooks',
  },
});
