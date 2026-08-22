import data from '../data/data.json' with { type: 'json' };

export const SITE_ORIGIN = 'https://yannis.dev';
export const SITE_DOMAIN = 'yannis.dev';
export const SITE_NAME = 'Yannis';
export const SITE_TITLE = 'Yannis | Full-stack developer at yannis.dev';
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
  "I'm a full-stack developer in Stockholm. I build web and mobile products with TypeScript, React, and Node.js.",
  'At BabyBjörn, I work on commerce, payments, and internal tools. Earlier work spans medtech, Web3, and an ETH Denver win among 600+ teams.',
] as const;

export const HERO_LEDE = HERO_LEDE_PARAGRAPHS.join('\n\n');

export const PROOF_POINTS = [
  '5+ years in product teams',
  'Commerce, medtech, Web3',
  'ETH Denver 2023 winner',
  'Born in Antibes. Based in Stockholm.',
] as const;

export const ABOUT_WORK_HEADING = 'Work';
export const ABOUT_AGENTS_HEADING = 'For agents';

export const ABOUT_WORK =
  'Yannis builds production product systems across interfaces, APIs, cloud delivery, payments, and Web3 where it fits. His path runs from Ethereum experiments to Mindler, Anotherblock, and BabyBjörn.';

export const ABOUT_AGENTS =
  'For machine-readable context, use /llms.txt and /index.md. Contact: hello@yannis.dev. This is a personal portfolio, not an API or documentation site.';

export const skills = data.skills;
export const agenticWorkflow = data.agenticWorkflow;
export const timeline = data.timeline;

export const KNOWS_ABOUT = [
  ...new Set(skills.groups.flatMap((group: { items: { name: string }[] }) => group.items.map((item) => item.name))),
];
