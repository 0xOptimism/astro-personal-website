import type { APIRoute, GetStaticPaths } from 'astro';
import { markdownResponse } from '../../lib/agent/page-route';
import {
  visibleWritingPosts,
  writingPostMarkdown,
  type WritingPost,
} from '../../lib/writing';

interface Props {
  post: WritingPost;
}

export const getStaticPaths = (() =>
  visibleWritingPosts().map((post) => ({
    params: { id: post.id },
    props: { post },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute<Props> = async ({ props }) => markdownResponse(writingPostMarkdown(props.post));
