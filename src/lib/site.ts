import data from '../data/data.json' with { type: 'json' };

export const SITE_ORIGIN = 'https://yannis.dev';
export const SITE_DOMAIN = 'yannis.dev';
export const SITE_NAME = 'Yannis';
export const SITE_TITLE = 'Yannis.dev | Yannis, full-stack developer in Stockholm';
export const SITE_EMAIL = 'hello@yannis.dev';
export const SITE_JOB_TITLE = 'Full-stack developer';
export const SITE_LOCATION = 'Stockholm';
export const SITE_COUNTRY = 'SE';
export const SITE_EMPLOYER = 'BabyBjörn';
export const SITE_OG_IMAGE_PATH = '/og-image.png';
export const SITE_OG_IMAGE_WIDTH = 1200;
export const SITE_OG_IMAGE_HEIGHT = 630;
export const SITE_OG_IMAGE_ALT =
  'Yannis portfolio, full-stack developer in Stockholm';

export const SAME_AS = [
  'https://www.linkedin.com/in/yannis-b-713090179/',
  'https://github.com/0xOptimism',
] as const;

export const SITE_DESCRIPTION =
  'Yannis is a Stockholm-based full-stack developer building web, mobile, and commerce software with TypeScript, React, and Node.js.';

export const HERO_KICKER = "Hey, I'm";
export const HERO_NAME = SITE_NAME;
export const HERO_ROLE = SITE_JOB_TITLE;

export const HERO_LEDE_PARAGRAPHS = [
  'I work on commerce and payments at BabyBjörn in Stockholm.',
] as const;
export const HERO_WRITING = 'I occasionally write about agents and building software.';

export const HERO_LEDE = [...HERO_LEDE_PARAGRAPHS, HERO_WRITING].join('\n\n');

export const PROOF_POINTS = [
  'BabyBjörn · commerce',
  'ETH Denver 2023 winner',
  'Stockholm',
] as const;

export const ABOUT_WORK_HEADING = 'Work';
export const ABOUT_AGENTS_HEADING = 'For agents';

export const ABOUT_WORK =
  'Yannis builds production product systems across interfaces, APIs, cloud delivery, payments, and Web3 where it fits. His path runs from Ethereum experiments to Mindler, Anotherblock, and BabyBjörn.';

export const ABOUT_AGENTS =
  'Yannis developer resources are public and unauthenticated: /llms.txt, /index.md, /openapi.json, /api/status.json, /.well-known/mcp.json, /developers, JSON error docs, versioning docs, rate-limit docs, and the Streamable HTTP MCP server at /mcp. Contact: hello@yannis.dev.';

export const skills = data.skills;
export const agenticWorkflow = data.agenticWorkflow;
export const timeline = data.timeline;

export const KNOWS_ABOUT = [
  ...new Set(skills.groups.flatMap((group: { items: { name: string }[] }) => group.items.map((item) => item.name))),
];
