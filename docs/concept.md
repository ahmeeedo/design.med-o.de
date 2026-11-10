# Concept: med.o documentation site

Exported from the concept doc on 2026-11-10. This file is the source of truth for the docs site; change it here first.

## Goal and audiences

design.med-o.de becomes the place where people learn how to design and build with the med.o Design System; Storybook moves to storybook.med-o.de and stays the workbench for component APIs, playgrounds and tests. The site is also the first product built with the system, so every gap it reveals goes back into the system.

| Audience | Comes for | Needs from the site |
|---|---|---|
| Developers | Install, use, extend | Setup, props, code to copy, tokens in code, a link to the playground |
| Designers | Design with the Figma library | Foundations, when to use what, anatomy, do and don't, Figma links |
| Product and content | Decide flows and wording | Patterns, decision tables, writing rules, accessibility duties |
| Public and community | Evaluate or adopt it | What it is, why it is good, license, status, changelog, how to contribute |

Success means: someone new builds a correct form from the docs alone; a designer finds the rule for a decision in under a minute; search engines and translation tools read every page.

## Principles

1. **Built only with the system.** Every element on the site is a @med-o/ui component or a token. What is missing becomes an issue in the design system, not a one-off in the site.
2. **Installed like any customer.** The site uses the published npm packages, never workspace links. It proves the packages work outside the monorepo.
3. **Content first, interaction where it helps.** Every page is prerendered HTML that reads without JavaScript; React makes the examples and the page chrome interactive.
4. **One source per fact.** Props, tokens, status and changelog come from the packages at build time; prose never repeats a value that can be read.
5. **Accessible and fast by default.** WCAG 2.2 AA, keyboard and screen reader tested like the components; small pages, no tracking without consent.
6. **Readable for machines.** Plain semantic HTML that search engines, browser translation and AI tools can read; an llms.txt for the whole site.
7. **Carbon's depth, Apple's clarity.** Fixed sections per page type, decision tables and concrete numbers, each rule one sentence with its reason.

## Tech stack

Decision: **Next.js 16** (App Router, static export) with React 19 and @med-o/ui, MDX for content, Pagefind for search, served as static files. The site is built the way customers build with the system, as one React app, so it proves the components and our documented Next.js setup in daily use.

| Option | Strengths | Weaknesses for this site |
|---|---|---|
| **Next.js 16** (chosen) | One React model end to end; real-world test of @med-o/ui with router, theme and overlays in one tree; our Next setup is already tested in CI; common for React design systems | Ships React on every page; static export drops redirects, headers, image optimization and server actions (none needed: nginx handles redirects and headers) |
| Astro 7 | Static HTML by default, React only in islands, very small pages | Two component models; islands share no React context, so components run in a setup no customer has |
| React Router 7 (framework mode, prerender) | Plain React, flexible | Least docs tooling; more to build by hand |
| Astro Starlight, Docusaurus (docs themes) | Search, sidebar, i18n out of the box | Bring their own design system, against principle 1 |
| Headless CMS (Payload, Strapi) | Editing without Git | Not a frontend; adds a server, a database and backups; examples must stay code in Git anyway |

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16, App Router, `output: 'export'` | Static files for nginx; full HTML per page for search engines and translation |
| UI | @med-o/ui and @med-o/design-tokens from npm | Principle 1 and 2 |
| Content | MDX with typed front matter (Zod), read at build time | Status, related links, Figma URL checked at build |
| Live examples | Client components in the same React tree | Router, theme and toasts work as in a customer app |
| Code highlighting | Shiki at build time | No client JavaScript for code; our code tokens for colors |
| Search | Pagefind 1.6, Component UI, indexed after `next build` | Fully static index, no server, no account |
| Translation | Browser translation and third-party tools on plain HTML; `translate="no"` on code | No second language to maintain now |
| Package manager and runtime | npm, Node 24 | Same as the design system repo |

### Trade-offs of Next.js

| Risk | What it means here | How we limit it |
|---|---|---|
| React on every page | More JavaScript than a static-first framework | Pages are prerendered HTML; examples load on demand; budget of 270 kB JavaScript (gzip) per page checked in CI |
| Static export limits | No redirects, headers, ISR, server actions or on-request image resizing | Redirects and headers in nginx; images resized at build time (see Images); the site has no server logic |
| Server and client components | `"use client"` boundaries to place correctly | @med-o/ui is marked `"use client"`; pages stay server components, examples are client components |
| Fast major releases | About one major a year | Upgrade once per major; content and examples do not depend on Next.js APIs |
| Owner | Next.js is led by Vercel; it stays open source and host-independent | Output is plain static files served by our own nginx: no lock-in |

### Images

Images are optimized at build time instead of on request: a build step (sharp) writes each image as AVIF and WebP in 3–4 widths. Pages show them with the @med-o/ui `Image`, which passes `srcSet` and `sizes` to the browser, reserves the space by ratio, loads lazily unless `priority` is set and fades in from a blur preview. Most visuals on the site are live components and SVG, so few raster images are expected at all.

Who uses what: Shopify's Polaris site was built with Next.js, the common choice for React design systems. Cloudflare runs its developer docs on an Astro-based framework, the better fit for pure reading sites without a component library to prove.

More sources: [Cloudflare acquires Astro](https://www.businesswire.com/news/home/20260116386991/en/Cloudflare-Acquires-Astro-to-Accelerate-the-Future-of-High-Performance-Web-Development) · [Cloudflare docs on Astro](https://www.infoq.com/news/2025/02/cloudflare-documentation-astro) · [Cloudflare docs stack](https://developers.cloudflare.com/style-guide/how-we-docs/our-site/) · [Polaris repo](https://www.github.com/Shopify/polaris)

Sources: [Astro releases](https://releases.sh/astro.md) · [Astro 6 news](https://astro.build/blog/whats-new-march-2026/) · [Pagefind](https://pagefind.app/) · [Next.js static exports](https://unpkg.com/next@16.3.8/dist/docs/01-app/02-guides/static-exports.md)

## Architecture

Two repositories, joined only by npm: the design system publishes, the docs site installs. A release of the design system opens a pull request in the docs repo, so the site never shows a version that does not exist.

```
medo-design_system  --(npm publish)-->  @med-o/ui, @med-o/design-tokens  --(npm install)-->  design.med-o.de (docs repo)
```

Both sites are static builds deployed by Coolify; the docs site never imports code from the design system repo directly.

| Part | Lives in | Produces |
|---|---|---|
| Packages @med-o/ui, @med-o/design-tokens | medo-design_system | npm packages, incl. CHANGELOG.md and the token docs JSON |
| Component manifest (new) | medo-design_system | `@med-o/ui/manifest.json`: per component its props with descriptions, status, Storybook id, Figma link, a11y keys |
| Storybook | medo-design_system | storybook.med-o.de: playgrounds, tests, screenshots |
| Docs site | design.med-o.de (new repo, public) | design.med-o.de: static HTML, search index, llms.txt |

How the site reads its facts at build time:

- **Props, status, a11y, Figma link** from the manifest. The design system builds it from the same JSDoc and story parameters Storybook uses today, so it cannot drift.
- **Tokens** from `@med-o/design-tokens/docs/*.json`, the files the Foundations pages already use.
- **Changelog** from the CHANGELOG.md files in the installed packages.
- **Examples** as .tsx files in the docs repo; the page renders the example and shows its own source, one file for both.
- **Deep links** to Storybook per component ("Open in Storybook") and back from Storybook to the guideline page.

Versioning: the site documents the latest release; every page shows the package version it was built with. Versioned docs (one site per major) only after 1.0.

## Information architecture

Two kinds of pages: three site pages without a sidebar (Home, Showcase, Updates) and the docs with one sidebar for all five docs areas. URLs are short and readable (`/docs/components/button`, `/docs/patterns/form`); existing Storybook links redirect to the new pages.

### Site pages (no sidebar)

| Page | URL | Content | Main audience |
|---|---|---|---|
| Home | `/` | Hero only, one screen high: headline, install command (Code block with tabs), Get started and Browse components, live examples in three sets (App, E-Commerce, Lifestyle) | Everyone, first visit |
| Showcase | `/showcase` | Highlights carousel of real interfaces (each card names the components it uses) · Why med.o (6 reasons) · Light and Dark comparison with a handle | Decision makers, designers |
| Updates | `/updates` | The latest releases, newest first, filter by Breaking, New, Improved, Fixed; breaking changes first as "Before you update"; a link to the full Changelog · Support · Browsers (with brand logos) · Help and resources (GitHub, Storybook, Figma, npm) | Everyone |

### Docs tree (with sidebar)

| Area | Pages, in sidebar order |
|---|---|
| Overview | Introduction, Getting started, Changelog |
| Guides | Theming, Languages, Styling, Versioning & support, Screen reader testing |
| Foundations | Colors, Typography, Spacing & sizes, Elevation & motion, Icons, Accessibility, Content, Long content |
| Patterns | Account, Form, Multi-step form, Search, Delete |
| Components | Layout (Container, Grid, Stack) · Actions (Button, Icon Button, Link, Menu, Toggle Button) · Forms (Checkbox, Combobox, Date & Time, Form, Listbox, Radio, Search, Select, Slider, Switch, Text Field, Upload) · Overlays (Alert Dialog, Bottom Sheet, Dialog, Drawer, Popover, Tooltip) · Feedback (Alert, Badge, Empty State, Progress, Toast) · Navigation (Breadcrumbs, Navigation, Pagination, Stepper, Tabs) · Data display (Accordion, Avatar, Bulk Action Bar, Card, Code block, Image & Media, List, List View, Table, Tag) |

Foundations, Patterns and Components follow the Storybook order; a page added there is added here.

- [x] Styling: one guide for CSS classes and the Tailwind theme, replaces today's Tailwind page (decided)
- [x] Component status: a section in Versioning & support, no own guide (decided)
- [x] Changelog: the complete archive of all releases of both packages, with search and filters (decided)

Changelog page: every release newest first, grouped by version with its date. Search finds words in entries, component names and token names; filters for type (Breaking, New, Improved, Fixed), package (`@med-o/ui`, `@med-o/design-tokens`), component and version range. Filters and search live in the URL, so a filtered view can be shared; the result count is announced. Breaking changes keep their "Before you update" note. Built from the CHANGELOG files at build time, searched in the browser without a server.

On every docs page: the hero (category line, title, excerpt, status where it applies, last updated date, one external link), the "On this page" rail and a Feedback section at the end. No breadcrumbs – sidebar groups are not pages. Component pages link to Storybook, foundation pages to Figma.

## Header, menu and page layout

Designed in Figma (file design.med-o.de) and approved: one header for the whole site with the page links in the middle, a sidebar only in the docs, one content column and an "On this page" rail. Everything is built from library components; gaps go to the design system as issues. Dark mode gets no separate designs – the tokens cover it.

### Page anatomy

Figma: "Design · Docs pages" (see docs/handoff.md).

| Region | Content | Component |
|---|---|---|
| Skip link | "Skip to content", first focusable element | SkipLink |
| Header (sticky) | Logo (links to Home) · Showcase, Docs, Updates in the middle · search · Give feedback · resources menu | SiteHeader, QuickSearch trigger |
| Area sidebar | Docs only: the five docs areas in one tree, a filter field, theme and language at the bottom; status badge on pages not Stable | SideNav, NavSection, Badge |
| Page header | Component pages: a hero box with category line (plain text, no links – sidebar groups are not pages), title, excerpt, status, last update and Storybook link; the tab list below it. Foundation pages: the same hero with their own tabs, without status. Pattern and guide pages: the hero without tabs and status; foundation pages link to Figma. No breadcrumbs. | Site/Page header (docs only), Badge, Link, Tab list |
| Content | Fixed sections of the page type, max width `container/prose` for text, examples up to `container/lg` | Container, Stack |
| On this page | The page's sections, current one marked | NavList (rail) |
| Footer | Name, version, license · Updates, GitHub, Storybook, Imprint, Privacy; docs pages add previous and next | Link, Pagination-style pair |

### Header

- **Links:** Showcase, Docs, Updates, centered; the current page is marked. The logo leads to Home, so Home has no link of its own.
- **Search:** a field-like trigger "Search … ⌘K" from 1280 px, an icon button below; both open QuickSearch.
- **Give feedback:** secondary button with the external icon, opens a GitHub issue.
- **Resources menu:** 9-dot icon button with a popover: Storybook, Figma library, GitHub, npm.
- **Theme and language:** Selects at the bottom of the docs sidebar and in the mobile menu (System, Light, Dark · English, German).
- **Height and behavior:** sticky, one line, a bottom border; no hide on scroll, so search stays one step away.

### Breakpoints

| Width | Header | Sidebar | On this page |
|---|---|---|---|
| ≥ 1280 px | Logo, 3 page links, search field, Give feedback, resources menu | Fixed left column, scrolls on its own | Right rail, sticky |
| 1024–1279 px | Same | Fixed left column | Disclosure "On this page" under the page title |
| 768–1023 px | Logo, 3 page links, search icon, Give feedback, resources menu | Hidden; "Menu" button above the title opens it in a Drawer | Disclosure under the title |
| < 768 px | Logo, search icon, menu button | Part of the fullscreen menu | Disclosure under the title |

### Mobile menu (< 768 px)

One sheet with the page links on top. On docs pages it adds a toggle Contents | Resources, the docs tree with the current page open, and theme and language. On Home, Showcase and Updates it shows the page links, the resources, theme and language – no docs tree. Give feedback sits at the bottom of both. Esc and the close button return focus to the menu button.

### Gaps in the design system

- [ ] SiteHeader: centered page links and a slot for search, feedback and the menu button
- [ ] Input: a trailing slot for the shortcut hint "⌘K"
- [ ] SideNav: a filter field above the tree
- [ ] "On this page" as a component (rail and disclosure), today only in Storybook's DocBlocks

Already added to the design system while designing: Code block (Figma and `@med-o/ui`, with the code/* tokens and `@med-o/ui/highlight`), Card "Show body", a Carousel whose viewport grows with its cards, the Tag label in every variant, and the icons skip-back, skip-forward, package, shopping-bag and music. Brand logos on Updates come from the brands' press kits and live in the docs repo.

Docs-only components (docs Figma file, not in the library): Site/Page header, Site/Feedback, Site/Card link, Spec/Marker and Spec/Redline, plus code samples for the guides; Site/Sidebar has one variant per docs area. Every one has a Desktop and a Mobile layout where it differs. Still missing in the library: a header cell and a code cell for _Table cell – docs tables use plain auto layout until then.

### Open questions

- [x] Component pages: tabs Guidelines, Styling, Code, Accessibility; hero and tabs as separate parts (decided)
- [x] Updates: in the header and in the footer (decided)
- [x] Header: Showcase, Docs, Updates in the middle; sidebar only in the docs (decided)
- [x] Home: hero only, one screen high, slim footer (decided)

## Content model

Each page type has fixed sections in a fixed order; the content schema rejects a page that misses a required one. Depth like Carbon, sentences like Apple: one rule per sentence, its reason after it, numbers where a decision needs them.

| Page type | Sections, in order | Comes from data |
|---|---|---|
| Component | Four tabs, each ending with Feedback (GitHub issue). Guidelines: playground with controls · overview (what, when, when not, the variants at a glance) · formatting (anatomy image, sizes and when to use them, alignment and spacing) · content (typography and wording, do and don't) · variants in detail · related · Styling, after Carbon's specifications: color (element, property, token) · typography (font size, weight, token) · structure (spacing image with redlines, element, property, px/rem, token) · sizes · Code: a card "React" that opens the component in Storybook – props live there only · Accessibility: what med.o provides · keyboard · design recommendations · development recommendations · testing status (axe and each screen reader, "Report a result") with the screen reader steps | Status, last update, keyboard table, screen reader steps and results, Storybook link |
| Pattern | Overview (when, when not, decision table) · Anatomy · Building it (one block per part) · Behavior (validation, loading, errors, empty, mobile, with timings) · Content · Accessibility · Rules (do and don't) · Related · References | Linked components and their status |
| Foundation | Four tabs after Carbon, each ending with Feedback. Overview: the model (for Colors: layers, layering model in Light and Dark, terms, interaction states, accessibility) · Guidelines: how to combine, Light and Dark, do and don't, related · Tokens: every group as a table (Light, Dark, token, Light → Dark, usage) · Code: CSS variables, Tailwind classes, JavaScript | All token values and contrast pairs |
| Guide | Goal · Steps · Examples · Pitfalls · Related | Versions, commands |

Site pages (Home, Showcase, Updates) have their own fixed layouts from Figma. Updates reads the changelogs of both packages, so nothing is written twice.

Writing rules, applied on every page:

- US English, sentence case headings, present tense, "you" for the reader.
- First sentence of a page and of a section states the point.
- A rule names the condition and the number: "The Undo toast stays 8 s", not "for a short time".
- Every do has a matching don't with the reason; images of wrong examples are labeled in text, not only by color.
- Code samples compile: they are type-checked in CI against the installed packages.

Migration: the current Storybook MDX pages (Foundations, Guides, Patterns) are rewritten into these templates on the new site. Storybook stays as it is; the new site leads, so a rule changes there first.

## Behavior

The site behaves like a product built with the system: every behavior below uses an existing component or becomes an issue in the design system.

| Area | Behavior | Built with |
|---|---|---|
| Search | Cmd/Ctrl + K opens a modal; results grouped by area (component, pattern, token, guide); token names and props are indexed; works offline after first load | Quick search pattern, Pagefind index |
| Theme | Follows the system; a switch in the header stores Light or Dark; examples follow the page theme | `data-theme`, Theming guide |
| Navigation | Header with Showcase, Docs and Updates; one sidebar in the docs; "On this page" rail from 1024 px; bottom of each page: previous and next | Side navigation |
| Mobile | Below 640 px the sidebar becomes a drawer; tables stack; examples scroll inside their frame | Drawer, StackTable rules from Storybook |
| Examples | Live, keyboard usable, "Show code" and "Copy"; "Open in Storybook" for every prop | Client components, Shiki |
| Copy | Copy buttons on code, token names and hex values, with a toast | Toast |
| Language | Page in English with `lang="en"`; code, token names and props marked `translate="no"` so translation tools leave them | Plain HTML |
| Feedback | "Report an issue" opens a prefilled issue: page content in the docs repo, component bugs in the design system repo; issues are the only way to contribute | Link, no tracking |
| Status | Badges for Experimental, Beta, Stable, Deprecated; deprecated pages point to the replacement | Badge |

## Quality

The same bar as the components: checks run on every pull request and a failing one stops the merge.

| Check | Rule | Tool |
|---|---|---|
| Accessibility | WCAG 2.2 AA, axe on every page in Light and Dark; keyboard path through header, search and one example per page | Playwright + axe |
| Screen reader | Manual run of the site's own flows (search, navigation, theme switch) before launch, like a component | NVDA, VoiceOver, TalkBack |
| Performance | Lighthouse 95+ on mobile; no page over 270 kB of JavaScript (gzip); LCP under 2.5 s | Lighthouse CI, budget script |
| Content | Required sections present; front matter valid; no broken internal links; code samples type-check | Content schema, link checker, `tsc` |
| Visual | Screenshots of each page template in Light, Dark and at 390 px | Playwright |
| SEO | Title and description per page, canonical URLs, sitemap, Open Graph image per page | Next.js sitemap, build check |
| Spelling | US English, the design system's word list | cspell |

Targets for Lighthouse are proposals to confirm after the first build. The JavaScript budget comes from the phase 0 build: every page loads about 262 kB gzip. React Aria takes 98 kB, React 75 kB, Next.js 65 kB, @med-o/ui 15 kB and the site's own code 4 kB. The first proposal of 100 kB is out of reach, because React and Next.js alone take 140 kB. The budget of 270 kB stops regressions. The next lever is React Aria: it ships date code the site does not use.

## Hosting and operations

Both sites stay on the existing Coolify server, each as a static site with its own deploy; nothing needs a running Node server.

Server stack, the same as Storybook today: GitHub Actions builds a Docker image (nginx:alpine with the static files and the Pagefind index), pushes it to the GitHub Container Registry and calls the Coolify deploy webhook. Coolify's Traefik proxy handles the domain and HTTPS. nginx adds caching for hashed assets, compression and security headers. No database and no Node process run on the server.

| Site | Domain | Deploys when | Preview |
|---|---|---|---|
| Docs | design.med-o.de | Merge to main in medo-docs | One preview URL per pull request |
| Storybook | storybook.med-o.de | Merge to main in medo-design_system (today's workflow, new domain) | As today |

Moving Storybook off design.med-o.de breaks shared links like `design.med-o.de/?path=/docs/components-actions-button--docs`. The docs home page reads `?path=` and forwards to the matching new page, or to storybook.med-o.de when there is none. A 301 is not possible for a query string on a static host, so a small script does it.

Operations:

- The Coolify token for deploys expires 2026-12-06; the reminder is set for 2026-11-30. The new repo needs its own deploy token or webhook.
- Dependency updates: a release in the design system opens a pull request in medo-docs; Renovate or Dependabot covers the rest.
- No cookies, no analytics at launch. If analytics come later: a cookieless, self-hosted tool on the same server.

## Roadmap

Five phases, each closed by a gate you sign off; dates follow once the repo is set up.

| Phase | Scope | Gate |
|---|---|---|
| 0 Set up | New repo, Next.js 16, CI and previews, component manifest in @med-o/ui | Stack decided |
| 1 Templates | Header, search, theme, navigation; one page per type | Templates approved |
| 2 Content | Foundations, guides, patterns; Stable and Beta components | All checks green |
| 3 Launch | design.med-o.de live, Storybook moves, old links forward, screen reader run | Site live |
| 4 Grow | New patterns (loading, empty, notifications), contributions | – |

Phase 1 builds one page per type (Button, Form, Colors, Styling) and the three site pages before any migration, so the templates are proven on real content first.

Code follow-ups from the component page design, part of phase 1: the Playground with the controls Variant, Size, Icon, Pending and Disabled, and the screen reader steps in Button.stories.tsx rewritten for the docs page – they lead through the Playground, so the same steps work for every component.

## Open decisions

| Question | Decision |
|---|---|
| Repo | `design.med-o.de`, public |
| Storybook | Stays as it is, moves to storybook.med-o.de |
| Figma links | On foundation pages; component pages link to Storybook only |
| Contributions | Issues only: content in the docs repo, components in the design system repo |
| Launch scope | All components |

- [x] Framework: Next.js 16, no CMS (decided)
- [x] Component manifest in @med-o/ui: yes, generated at build (decided)
