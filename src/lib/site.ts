import data from '../data/data.json';

export const SITE_ORIGIN = 'https://yannis.dev';
export const SITE_DOMAIN = 'yannis.dev';
export const SITE_NAME = 'Yannis';
export const SITE_TITLE = 'Yannis | Full-stack developer at yannis.dev';
export const SITE_EMAIL = 'hello@yannis.dev';
export const SITE_JOB_TITLE = 'Full-stack developer';
export const SITE_LOCATION = 'Stockholm';
export const SITE_COUNTRY = 'SE';
export const SITE_EMPLOYER = 'BabyBjörn';

export const SAME_AS = [
  'https://www.linkedin.com/in/yannis-b-713090179/',
  'https://github.com/0xOptimism',
] as const;

export const SITE_DESCRIPTION =
  'Yannis is a Stockholm-based full-stack developer at yannis.dev. He builds production web apps across frontend, backend, and mobile with TypeScript, React, Node.js, and agentic workflows.';

export const HERO_KICKER = "Hey, I'm";
export const HERO_NAME = SITE_NAME;
export const HERO_ROLE = SITE_JOB_TITLE;

export const HERO_LEDE = [
  'I am Yannis, the full-stack developer behind yannis.dev, currently based in Stockholm and born in Antibes.',
  'I build production web apps across frontend, backend, and mobile, mostly with TypeScript, React, Node.js, and agentic workflows.',
  `I currently ship e-commerce, payments, and internal developer tooling at ${SITE_EMPLOYER}, after product work in medtech and Web3, including an ETH Denver 2023 win among 600+ teams.`,
].join(' ');

export const PROOF_POINTS = [
  '5+ years shipping product',
  'Medtech, e-commerce, Web3',
  'ETH Denver 2023 winner',
  'Antibes-born, Stockholm-based',
] as const;

export const ABOUT_WORK_HEADING = 'Work';
export const ABOUT_AGENTS_HEADING = 'For agents';

export const ABOUT_WORK =
  'Yannis works as a full-stack developer on production product systems: typed interfaces, pragmatic APIs, cloud delivery, payments, and Web3 when it adds leverage. The public record on yannis.dev covers a self-taught start in Ethereum, an early seat at the medtech startup Mindler, frontend work on the Anotherblock music NFT marketplace, and current full-stack work at BabyBjörn.';

export const ABOUT_AGENTS =
  'Agents should start at yannis.dev, then read /llms.txt for the site map and /index.md for a markdown twin of this page. Contact is hello@yannis.dev. This is a personal portfolio, not a SaaS API, MCP server, or docs product.';

export const skills = data.skills;
export const agenticWorkflow = data.agenticWorkflow;
export const timeline = data.timeline;

export const KNOWS_ABOUT = [
  ...new Set(skills.groups.flatMap((group: { items: { name: string }[] }) => group.items.map((item) => item.name))),
];
