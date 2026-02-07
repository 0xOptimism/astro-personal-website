# Yannis — Personal Portfolio

A personal portfolio site built with [Astro](https://astro.build). Single-page layout with hero, skills, career timeline, contact form, and social links.

## Overview

- **Hero** — Name, role (Full-Stack Developer), and short bio
- **Skills** — Tech stack with icons (e.g. React, TypeScript, Node.js, Tailwind)
- **Timeline** — Career and education milestones (from 1990 to present)
- **Contact** — Form for getting in touch
- **Footer** — Links to LinkedIn and GitHub

Content is driven by `src/data/data.json` (skills, timeline, interests, socials). Styling uses Tailwind CSS v4 and custom CSS variables; typography is Source Serif 4 and Syne.

## Tech Stack

- [Astro](https://astro.build) 5
- [React](https://react.dev) (via `@astrojs/react`)
- [Tailwind CSS](https://tailwindcss.com) v4
- TypeScript

## Project Structure

```
/
├── public/
│   ├── assets/          # Images (e.g. interests, projects)
│   └── favicon.ico
├── src/
│   ├── components/      # Header, Skills, Timeline, ContactForm, Social, etc.
│   ├── data/
│   │   └── data.json    # Skills, timeline, interests, social links
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   └── index.astro
│   └── styles/
│       └── global.css
├── astro.config.mjs
└── package.json
```

Routes come from `.astro` and `.md` files in `src/pages/`. Static assets live in `public/`.

## Commands

From the project root:

| Command           | Action                                      |
| ----------------- | ------------------------------------------- |
| `npm install`     | Install dependencies                        |
| `npm run dev`     | Start dev server at `http://localhost:4321` |
| `npm run build`   | Build for production to `./dist/`           |
| `npm run preview` | Preview the production build locally        |

Use `yarn` instead of `npm` if your project uses Yarn.

## Learn More

- [Astro docs](https://docs.astro.build)
- [Astro Discord](https://astro.build/chat)
