# design.med-o.de

The documentation site of the med.o Design System, live at [design.med-o.de](https://design.med-o.de). The site is built with the system itself: it installs `@med-o/ui` and `@med-o/design-tokens` from npm, the same way you do in your own app.

It is a Next.js app with the App Router and a static export. There is no server – the build writes plain files.

## Run it

You need Node 24 (see `.nvmrc`) and npm.

```bash
npm ci          # install the exact versions from package-lock.json
npm run dev     # start the dev server at http://localhost:3000
npm run build   # build the static site into out/
npm run lint    # ESLint without warnings, then the TypeScript check
```

`npm run build` writes the site to `out/`. Serve that folder with any static web server.

## Scripts

Every script in `package.json`, run with `npm run <name>`. Most checks run on the built site, so run `npm run build` first.

Run:

- `dev` – the dev server at http://localhost:3000.
- `build` – the static site in `out/` and its search index (Pagefind).

`predev` and `prebuild` run first on their own: they write each page's last update from git (`scripts/page-dates.mjs`).

Checks (each one is a job in `.github/workflows/ci.yml`):

- `lint` – ESLint without warnings, then the TypeScript check.
- `test:a11y` – axe (WCAG 2.2 AA) and hydration on every page, Light and Dark, at 1440 and 390 px.
- `test:keyboard` – the keyboard path through header, search and menu.
- `test:screenshots` – every template page against its reference in `tests/screenshots/` (references come from CI; see `tests/screenshots.spec.mts`).
- `check:js-budget` – JavaScript per page, at most 270 kB gzip.
- `check:links` – every internal link reaches a file.
- `check:content` – the content schema: required sections per page type.
- `check:samples` – `ts` and `tsx` code samples in MDX type-check against the installed packages.
- `check:spelling` – US English with the project's word list (`cspell-words.txt`).
- `check:sitemap` – the sitemap lists every page and nothing else.
- `check:lighthouse` – Lighthouse on mobile for one page per template, with a summary (`lighthouserc.json`).

Data:

- `smoke:data` – prints what the build reads from the packages: the component manifest, the token groups and the releases.
