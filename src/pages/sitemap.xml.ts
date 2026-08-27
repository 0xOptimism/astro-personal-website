import type { APIRoute } from 'astro';
import { sitemapXml } from '../lib/agent/seo';
import { WRITING_INDEX, visibleWritingPosts, writingPath } from '../lib/writing';

export const GET: APIRoute = async () => {
  const writingEntries = [
    { path: WRITING_INDEX.path, changefreq: 'monthly' as const, priority: '0.8' },
    ...visibleWritingPosts().map((post) => ({
      path: writingPath(post.id),
      changefreq: 'yearly' as const,
      priority: '0.7',
      lastmod: (post.updatedDate ?? post.pubDate).slice(0, 10),
    })),
  ];

  return new Response(sitemapXml(writingEntries), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
