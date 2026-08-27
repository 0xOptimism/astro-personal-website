import { SITE_NAME, SITE_ORIGIN } from './site.ts';
import { WRITING_POSTS } from './writing.generated.ts';

export interface WritingPost {
  id: string;
  title: string;
  description: string;
  pubDate: string;
  updatedDate?: string;
  tags: readonly string[];
  draft: boolean;
  body: string;
  xPostUrl?: string;
}

const POSTS: readonly WritingPost[] = WRITING_POSTS;

export const WRITING_INDEX = {
  path: '/posts',
  markdownPath: '/posts.md',
  title: `Posts by ${SITE_NAME}`,
  description: 'Writing about agents and building software.',
} as const;

export function writingPath(id: string): string {
  return `${WRITING_INDEX.path}/${id}`;
}

export function writingMarkdownPath(id: string): string {
  return `${writingPath(id)}.md`;
}

export function visibleWritingPosts(): WritingPost[] {
  return POSTS.filter((post) => !post.draft).sort((left, right) =>
    right.pubDate.localeCompare(left.pubDate),
  );
}

export function writingPostById(id: string): WritingPost | undefined {
  const post = POSTS.find((entry) => entry.id === id);
  return post && !post.draft ? post : undefined;
}

export function formatPostDate(date: Date | string): string {
  const value =
    typeof date === 'string' ? new Date(`${date.slice(0, 10)}T00:00:00.000Z`) : date;

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(value);
}

export function writingPostMarkdown(post: WritingPost): string {
  const tags = post.tags.length > 0 ? `\n\nTags: ${post.tags.join(', ')}` : '';
  const discussion = post.xPostUrl
    ? `\n\nComments or questions: [Join the conversation on X](${post.xPostUrl})`
    : '';

  return `# ${post.title}\n\n${post.description}\n\nPublished ${formatPostDate(post.pubDate)}.${tags}\n\n${post.body.trim()}${discussion}\n`;
}

export function writingIndexMarkdown(posts: readonly WritingPost[] = visibleWritingPosts()): string {
  const entries = posts
    .map(
      (post) =>
        `- [${post.title}](${SITE_ORIGIN}${writingMarkdownPath(post.id)}) — ${post.description}`,
    )
    .join('\n');

  return `# ${WRITING_INDEX.title}\n\n${WRITING_INDEX.description}\n\n${entries || 'No posts published yet.'}\n`;
}

export function writingCollectionMarkdown(): string {
  const posts = visibleWritingPosts();
  return [writingIndexMarkdown(posts), ...posts.map(writingPostMarkdown)]
    .map((part) => part.trim())
    .join('\n\n---\n\n');
}
