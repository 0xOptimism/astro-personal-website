import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://yannis.dev',
  integrations: [react()],
  vite: {
    plugins: [tailwind()],
  },
});
