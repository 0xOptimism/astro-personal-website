# yannis.dev

Source for [yannis.dev](https://yannis.dev). Stockholm, full-stack, currently at BabyBjörn.

The homepage is one HTML page: hero, stack, how I use coding agents, career timeline from 2017, `hello@yannis.dev`, LinkedIn and GitHub. The same facts also ship as markdown so a crawler or agent can read them without scraping the layout.

## Page

| Section | What it is |
| --- | --- |
| Hero | Name, role, bio |
| Stack | Frontend, backend, platforms, Web3 |
| AI workflow | Codex, Claude Code, Hermes, Cursor Cloud Automations |
| Timeline | Work and education, 2017 to now |
| Contact | `hello@yannis.dev` |
| Footer | LinkedIn, GitHub |

Skills, workflow, timeline, and socials live in `src/data/data.json`. Titles, bio, email, OG image, and related constants live in `src/lib/site.ts`. HTML, markdown, JSON-LD, and `llms.txt` all read from there.

The control in the corner switches visual skins: default, Grok 4.6, Claude Opus 5, Kimi K3, GPT-5.6 Sol High. The choice is stored as `selected-model-skin` in `localStorage`.

## Agent endpoints

| Path | What you get |
| --- | --- |
| `/` | HTML homepage |
| `/index.md` | Markdown version of the homepage |
| `/llms.txt` | Short index: when to use the site, key URLs |
| `/llms-full.txt` | That index plus the full homepage markdown |
| `/sitemap.xml` | URL list |
| `/robots.txt` | Crawl rules, including common AI bots |

`GET /` also looks at `Accept`. A Netlify edge function (`netlify/edge-functions/negotiate-markdown.ts`) returns `text/html` or `text/markdown`. Unsupported types get `406`. Paths with a file extension (`/llms.txt`, `/sitemap.xml`, images) skip the function and hit the static server.

HTML points at `/index.md` with `rel="alternate"` and at `/llms.txt` with `rel="describedby"`. The same links go on the `Link` header. The homepage JSON-LD graph is `Person`, `WebSite`, and `ProfilePage`.

```bash
curl -H 'Accept: text/markdown' https://yannis.dev/
curl https://yannis.dev/index.md
curl https://yannis.dev/llms.txt
```

## Stack

- [Astro](https://astro.build) 5, TypeScript
- [Tailwind CSS](https://tailwindcss.com) v4 (`@tailwindcss/vite`)
- [Vitest](https://vitest.dev)
- [Netlify](https://www.netlify.com) for `dist/` plus the edge function
- [Umami](https://umami.is) (`PUBLIC_UMAMI_WEBSITE_ID`)

Pages and components are `.astro`. `@astrojs/react` is in the config and unused.

## Layout

```
/
├── netlify/
│   └── edge-functions/
│       └── negotiate-markdown.ts   # Accept: HTML vs markdown
├── public/                         # Favicon, OG image, logos
├── src/
│   ├── components/
│   ├── data/data.json
│   ├── layouts/Layout.astro
│   ├── lib/
│   │   ├── site.ts
│   │   └── agent/                  # markdown, llms.txt, SEO, Accept parsing
│   ├── pages/
│   └── styles/global.css
├── tests/
├── astro.config.mjs
├── netlify.toml
└── package.json
```

## Commands

Yarn, from the repo root:

| Command | Action |
| --- | --- |
| `yarn install` | Install |
| `yarn dev` | `http://localhost:4321` |
| `yarn build` | Write `./dist/` |
| `yarn preview` | Serve `./dist/` |
| `yarn test` | Vitest |

`tests/build-output.test.ts` reads `dist/` and skips if you have not built. Run `yarn build` first if you want those cases.

## Deploy

Netlify: `yarn build`, Node 20, publish `dist/`. `negotiate-markdown` is mounted on `/*` in `netlify.toml`.
