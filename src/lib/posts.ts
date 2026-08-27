import { getCollection, type CollectionEntry } from 'astro:content';
import {
  SITE_NAME,
  SITE_OG_IMAGE_PATH,
  SITE_ORIGIN,
} from './site.ts';
import { writingPath } from './writing.ts';

export type Post = CollectionEntry<'posts'>;

export async function getVisiblePosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);

  return posts.sort(
    (left, right) => right.data.pubDate.valueOf() - left.data.pubDate.valueOf(),
  );
}

export function postPath(post: Post): string {
  return writingPath(post.id);
}

export function postJsonLd(post: Post): string {
  const path = postPath(post);
  const url = new URL(path, SITE_ORIGIN).href;

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.data.title,
    description: post.data.description,
    datePublished: post.data.pubDate.toISOString(),
    dateModified: (post.data.updatedDate ?? post.data.pubDate).toISOString(),
    url,
    mainEntityOfPage: url,
    image: new URL(SITE_OG_IMAGE_PATH, SITE_ORIGIN).href,
    keywords: post.data.tags,
    author: {
      '@type': 'Person',
      '@id': `${SITE_ORIGIN}/#person`,
      name: SITE_NAME,
      url: SITE_ORIGIN,
    },
    isPartOf: {
      '@id': `${SITE_ORIGIN}/#website`,
    },
  }).replace(/</g, '\\u003c');
}
