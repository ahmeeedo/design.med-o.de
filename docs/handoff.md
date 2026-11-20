# Handoff: phase 1 (templates) and phase 2 (content)

State on 2026-11-15. The concept (`docs/concept.md`) says what the site is and why. This file says where we stand, how the site is built after phase 1, and what phase 2 has to do.

## Where we stand

- **Phase 0: done.** The site shell builds, deploys a preview per pull request and passes every check.
- **Phase 1: done in code.** Every template is on `main` (pull requests #12 to #29), and the screenshot and Lighthouse checks follow with the pull request from `ci/visual-and-lighthouse`. The phase 1 gate waits for your approval of the templates on the preview.
- **Design system:** `@med-o/ui` and `@med-o/design-tokens` 0.19.0, installed from npm.
- **Repos:**
  - Design system: https://github.com/ahmeeedo/medo-design_system, locally `~/Documents/GitHub/medo-design_system`.
  - Docs site: https://github.com/ahmeeedo/design.med-o.de (public), locally `C:\Programming\design.med-o.de\design.med-o.de`. This repo.

## Phase 1: what phase 2 builds on

### Pages and parts

| Page | Route | Source |
|---|---|---|
| Introduction | `/docs/overview/introduction` | `content/docs/overview/introduction.mdx` |
| Styling guide | `/docs/guides/styling` | `content/docs/guides/styling.mdx` |
| Form pattern | `/docs/patterns/form` | `content/docs/patterns/form.mdx` |
| Colors foundation, 4 tabs | `/docs/foundations/colors`, `…/guidelines`, `…/tokens`, `…/code` | `content/docs/foundations/colors/` |
| Button component, 4 tabs | `/docs/components/button`, `…/styling`, `…/code`, `…/accessibility` | `content/docs/components/button/` |
| Changelog | `/docs/overview/changelog` | Both installed `CHANGELOG.md` files; search and filters in the URL |
| Home | `/` | `app/page.tsx` |
| Showcase | `/showcase` | `app/showcase/page.tsx` |
| Updates | `/updates` | `app/updates/page.tsx` |

- **Docs layout** (`components/docs-page.tsx`): the hero, the tab list on tabbed pages, "On this page" (rail from 1280 px, disclosure below) and the Feedback section at the end of every page and tab.
- **Search** (`components/site-search.tsx`): Pagefind results grouped by area.
- **Page dates:** "Updated …" in the hero comes from git (`scripts/page-dates.mjs`, run before `dev` and `build`).

### How to add a page

- **Content:** a page without tabs is one file, `content/docs/<area>/<page>.mdx` (guides, patterns, overview). A component or foundation page is a folder with one file per tab; the first tab (`guidelines.mdx` or `overview.mdx`) holds the front matter, every other tab file sets `tab`. `components/docs-content.ts` checks the front matter per page type and fails the build on a wrong field.
- **Routes and MDX maps:** every docs area has its own route under `app/docs/<area>/` and its own MDX map in `components/mdx/<area>.tsx`. Read the header of `components/docs-route.ts` (how to add an area route) and of `components/mdx/base.tsx` (which map builds on which). Each map's header lists its authoring forms.
- **Content schema** (`components/content-schema.ts`): the required "##" sections per page type, in order. A missing or misplaced section fails the build.

| Type | Required sections |
|---|---|
| Guide | Goal · Steps · Examples · Pitfalls · Related |
| Pattern | Overview · Anatomy · Building it · Behavior · Content · Accessibility · Rules · Related · References |
| Foundation | Overview: free, at least one · Guidelines: free sections, then Light and Dark · Do and don't · Related · Tokens: from data · Code: CSS · Tailwind · JavaScript |
| Component | Guidelines: Overview · Formatting · Content · Variants · Related (Playground from data) · Styling: Color · Typography · Structure · Sizes · Code: from data · Accessibility: What med.o provides · Keyboard · Design recommendations · Development recommendations · Testing status |
| Overview | Free, at least one section |

- **Component data blocks** (`components/mdx/components.tsx`): `<Playground />`, `<UsageWhen />`, `<UsageRules />`, `<A11yNotes />`, `<KeyboardTable />`, `<TestingStatus />`, `<ScreenReaderSteps />` and `<StorybookCard />` read the page's component from the `@med-o/ui` manifest. The front matter `status` and `storybookId` must match the manifest, or the build fails. The Playground renders Button only; a new component goes into `components/playground.tsx` and `PLAYGROUND_COMPONENTS`, and the build names what is missing.
- **Spec images:** SVG exports from the Figma library under `public/spec/<page>/`, written as Markdown images with alt text that names the labeled parts (`components/mdx/spec-image.tsx`).

### Decisions phase 2 follows

- **Tabs are routes** (`/docs/components/button/styling`): each tab has its own title, search entry and section anchors.
- **One route per docs area:** Next ships every client component in a route's modules on every page of that route, so each area loads only its own client code.
- **Figma first:** build only what an approved screen shows. Everything else is a design step, done in Figma before code.
- **Previous and next links and a designed Open Graph image wait for a Figma design.** Until then every page shares `public/og.png` (`scripts/og-image.mjs`).
- **No count badges on tabs:** nothing on a docs page is a count.
- **Foundation sections follow Figma:** Guidelines starts with free sections for the combinations, then Light and Dark, Do and don't, Related; Code has CSS, Tailwind, JavaScript.
- **Playground controls by kind:** 5 or more options are a Select, up to 4 a segmented group, a boolean a Switch. The controls and the screen reader steps come from the manifest, so Storybook and the site agree.
- **Live examples on Home and Showcase load after the page** (`components/examples/lazy.tsx`): rendered in the HTML, Home loaded 337.5 kB of JavaScript.
- **Logos only where the brand's terms allow it** (`public/brands/README.md`); every other brand shows its name as text.
- **React Aria texts in en-US only** (`next.config.ts`): this saves 5 to 14 kB per page. A second site language needs its locale added there.
- **The theme select is in the header** (`components/theme-select.tsx`), on every page; between 768 and 1023 px "Give feedback" is an icon button so the actions fit. A language select, when it comes, goes next to it.
- **Pages without a sidebar start at the page margin** (`Container align="start"`), like the docs pages, instead of centering their column.
- **Home and Showcase run off the screen:** the Home examples are cut by the right and bottom edge of the viewport (no bottom padding on `<main>` there), the Showcase carousel by the right edge (`Carousel bleed` in a full-width container). A mouse drags the carousel row and the Light and Dark split.

### Checks

Every job of `.github/workflows/ci.yml` runs on every pull request. The nine required checks of `main` are `lint`, `samples`, `spelling`, `build`, `a11y`, `keyboard`, `budget`, `links` and `sitemap`. Add `screenshots` and `lighthouse` to the `main` ruleset once the pull request that adds them is merged.

| Job | npm script | What it checks |
|---|---|---|
| `lint` | `npm run lint`, `npm run check:content` | ESLint, types, front matter and required sections |
| `samples` | `npm run check:samples` | `ts` and `tsx` code samples in MDX type-check |
| `spelling` | `npm run check:spelling` | US English with `cspell-words.txt` |
| `build` | `npm run build` | The static export and the search index |
| `a11y` | `npm run test:a11y` | axe (WCAG 2.2 AA) and hydration on every page, Light and Dark, 1440 and 390 px |
| `keyboard` | `npm run test:keyboard` | The keyboard path through header, search and menu |
| `budget` | `npm run check:js-budget` | JavaScript per page, at most 270 kB gzip |
| `links` | `npm run check:links` | Every internal link reaches a file |
| `sitemap` | `npm run check:sitemap` | The sitemap lists every page and nothing else |
| `screenshots` | `npm run test:screenshots` | Every template page against its reference in `tests/screenshots/` |
| `lighthouse` | `npm run check:lighthouse` | Mobile Lighthouse on one page per template (`lighthouserc.json`) |

- **A changed screenshot:** run the workflow "Update screenshots" on your branch (Actions → Run workflow); it commits the new references to the branch. Check the images in the commit, then close and reopen the pull request so CI runs for it. References come from the Linux runner only. Version numbers and the "Updated" date are masked, so a release alone changes no reference.
- **Hydration** (`tests/hydration.spec.mts`): a page fails when React logs a mismatch (#418, #423, #425), because the page then jumps and looks different without JavaScript.
- **axe exemption:** `tests/a11y.spec.mts` skips the contrast rule only on `[data-contrast-example]`, the don't samples that show a failing color pair on purpose. Every other rule still runs on them.
- **Lighthouse thresholds:** accessibility, best practices and SEO must score 100 and block the merge. Performance 95+ and LCP under 2.5 s only warn until the library `Image` shows a loaded image before hydration.

### JavaScript budget

The limit is 270 kB gzip per page (`scripts/js-budget.mjs`). After phase 1 the largest pages are the Button tabs at 268.6 kB, the Changelog at 267.0 kB and the Form pattern at 266.7 kB. Measure every new area route and every live example before you merge it. The lever is in the design system: library modules that import components they render only in some cases.

## Phase 2: content

Starts when the phase 1 templates are approved.

Goal: every foundation, guide and pattern page and every Stable and Beta component page lives on the site, on the approved templates. Gate: all pages are on dev-design.med-o.de, all checks are green, and you have approved each batch.

### Scope

| Area | Pages | Source today |
|---|---|---|
| Overview | Getting started (Introduction and Changelog exist after phase 1) | New text |
| Guides | Theming, Languages, Versioning & support (with Component status), Screen reader testing (Styling exists) | `apps/storybook/src/guides/*.mdx` |
| Foundations | Typography, Spacing & sizes, Elevation & motion, Icons, Accessibility, Content, Long content (Colors exists) | `apps/storybook/src/foundations/*.mdx` |
| Patterns | Account, Multi-step form, Search, Delete (Form exists) | `apps/storybook/src/patterns/*` |
| Components | 41 Beta components (Button, the only Stable one, exists) | Stories and their `medo` parameters, through the manifest |

The 41 Beta components by group: Layout 3 (Container, Grid, Stack) · Actions 4 (Icon Button, Link, Menu, Toggle Button) · Forms 11 (Checkbox, Combobox, Date & Time, Listbox, Radio, Search, Select, Slider, Switch, Text Field, Upload) · Overlays 5 (Bottom Sheet, Dialog, Drawer, Popover, Tooltip) · Feedback 5 (Alert, Badge, Empty State, Progress, Toast) · Navigation 4 (Breadcrumbs, Navigation, Pagination, Tabs) · Data display 9 (Accordion, Avatar, Bulk Action Bar, Card, Image & Media, List, List View, Table, Tag).

Not in phase 2: the 5 Experimental components (Code block, Inline code, Form, On this page, Stepper) – see the decisions below. The Experimental Quick search trigger is part of the Search page.

### Where each part of a page comes from

Nothing is written twice. Data that Storybook shows as well stays in the stories and reaches the site through the manifest; text only the site needs lives in MDX here.

| Part | Source |
|---|---|
| Hero: status, Storybook link, "Updated …" | Manifest (status, Storybook id), git |
| Playground | The component from `@med-o/ui` with the docs controls from the manifest |
| When, when not, do, don't | `medo.usage` in the stories → manifest |
| Keyboard, notes, screen reader steps and results | `medo.a11y` in the stories → manifest |
| Classes and states (Styling tab) | `medo.styling` in the stories → manifest; not on the page until Figma shows where |
| Tokens per element (Styling tab: color, typography, structure) | MDX today; later read from the component CSS at build of the manifest (each `var(--medo-…)` per class) |
| Anatomy and spacing images | Exported as SVG from the component's documentation frame in the Figma library, under `public/spec/<page>/` |
| Formatting, content rules, variants in detail, pattern and guide text | MDX in this repo |
| Token tables (foundations) | `@med-o/design-tokens` (`dist/docs`) |

### Order

Agree on each batch before you build it. Each batch is one pull request here; component batches need one in the design system first.

1. **Guides** (4 pages, text only): fastest proof that the migration flow works.
2. **Foundations** (7 pages): token tables from the package; Icons reads the icon list from lucide and the docs Figma page.
3. **Patterns** (4 pages): linked components with their status.
4. **Getting started.**
5. **Components**, by Storybook group: Actions, Forms, Overlays, Feedback, Navigation, Data display, Layout. Per group:
   - Design system pull request: docs controls for each Playground, screen reader steps rewritten for the Playground (like Button in phase 1), Figma link per component, token data in the manifest, a changeset.
   - Docs pull request: the pages, the exported SVGs, the MDX text, and each component in the Playground.

Per page, before it counts as done:

- Required sections of its type present (the content schema fails the build otherwise).
- Writing rules from the concept: US English, sentence case, one rule per sentence with its reason, numbers where a decision needs them.
- Code samples type-check; links resolve; cspell passes.
- axe and hydration in Light and Dark; a screenshot reference for each new template page.
- It appears in the sidebar and in search, with its token names and props.

### What phase 1 learned

- **The budget is close to its limit.** The largest pages are at 266 to 269 kB of 270. A page that needs more waits for a design system fix first, or the budget is raised on purpose, never by accident.
- **Design steps that wait for Figma:**
  - previous and next links;
  - a designed Open Graph image;
  - an Example block for patterns (live example with Show code);
  - mobile frames for guides, patterns and foundations;
  - Dark versions of spec images;
  - "Before you update" and a version range filter on the Changelog;
  - text-only logo slots on Updates;
  - an npm trademark notice.

### Checks to add in phase 2

- A check that every page in the docs tree exists and every Beta or Stable component in the manifest has a page.
- The JavaScript budget stays at 270 kB per page; see "What phase 1 learned".

### Design system work phase 2 needs

- Manifest: token data per class, Figma link per component, docs controls per Playground.
- Screen reader steps for the Playground in every Beta component's stories (41 files).

Open issues, filed in the design system repo, grouped by what they block:

- **Budget:**
  - Library modules import components they render only in some cases.
  - `StaticTable` and `CodeBlockTabs` in their own modules, `Card` server-safe.
- **Performance:** `Image` hides a loaded image until hydration (LCP).
- **Layout and mobile:**
  - Tables do not stack below 640 px.
  - `OnThisPage`: the rail does not mark the last sections on short pages, has no max height, and the disclosure is full width.
  - `SiteHeader`: compact logo width and the missing divider in the fullscreen menu.
  - `Card` breaks the native mobile `Select`.
- **Match with the docs Figma:**
  - Tab labels with `href` are underlined.
  - `List` has no cross type.
  - `medo-prose` body text color differs from the docs Figma.
  - `Highlight` has no brand tone.
  - Spec images do not adapt to Dark mode.
- **Behavior before hydration:**
  - Tag fades in on insert under reduced motion.
  - A scrolling code block is focusable only after hydration.
  - `aria-keyshortcuts` only after hydration.
- **Data:**
  - Token docs without group usage and with descriptions on 126 of 423 tokens.
  - No "last updated" per component in the manifest.
  - Button stories and Figma differ in the Playground (icon, label).
- **Small component gaps:** swatch, card tile and media slot, compare handle, 48 px icon tile, avatar tone, list view current row, example frame.

### Decisions to make

| Question | Proposal |
|---|---|
| Experimental components | Not in phase 2. They get pages in phase 3, before the launch, because the launch scope is all components. Until then they change too often. |
| Alert Dialog | One page with Dialog, as in Storybook; the docs tree lists Alert Dialog as a link to that section. |
| Storybook MDX pages after the move | Stay until the launch; in phase 3 each one becomes a short page that links to the new one. |
| Spec images | Exported from Figma as SVG and committed; an export script follows only if updates become frequent. |

## Figma

File "design.med-o.de", fileKey `6WcUGc3kLpyziny4HLXmep`: https://www.figma.com/design/6WcUGc3kLpyziny4HLXmep/design.med-o.de
Library "med.o Design System", fileKey `vOTfMtcpCwAJjuSZUkfpfj`: https://www.figma.com/design/vOTfMtcpCwAJjuSZUkfpfj/med.o-Design-System

Open a node with `?node-id=` and the id with `-` instead of `:` (e.g. `106-3625`).

### Approved screens

| Page | Node IDs |
|---|---|
| Header, sidebar, docs layout | Page "Design · Header & menu": Desktop default `11:1204`, menu open `11:1443`, filter `11:1716`, tablet drawer `11:1916`, mobile `11:2119`, mobile menu `11:2210`, mobile pages menu `79:4133` |
| Home | Page "Explorations · Home hero": Desktop App `37:2288`, E-Commerce `55:4578`, Lifestyle `55:5594`, Mobile `78:2827`; example cards "Home/Example · …" |
| Showcase | Desktop `67:979`, Mobile `79:1526` |
| Updates | Desktop `69:1061`, Mobile `79:2856` |
| Component page (Button) | Guidelines `106:3625`, Styling `107:1276`, Code `107:1984`, Accessibility `107:2591`; mobile `121:2152`, `122:2516`, `122:3095`, `122:3494` |
| Foundation (Colors) | Overview `132:4269`, Guidelines `132:4909`, Tokens `134:4781`, Code `132:5669` |
| Pattern (Form) | `127:3266` |
| Guide (Styling) | `128:3744` |
| Changelog | All releases `145:5698`, filtered `145:6568`, no results `145:6977` |

### Site components (docs file only, not in the library)

| Component | Node | In code |
|---|---|---|
| Site/Header | `10:2250` | `SiteHeader` from `@med-o/ui` (`components/site-header.tsx`) |
| Site/Sidebar (one variant per docs area) | `123:4710` | `NavList variant="sidebar"` from `@med-o/ui` (`components/docs-nav.tsx`) |
| Site/Footer | `76:3950` | Site shell (`components/site-footer.tsx`) |
| Site/Page header (Type Component / Foundation / None, Tab, Layout) | `104:2063` | Hero and tab list (`components/docs-hero.tsx`, `components/docs-tabs.tsx`) |
| Site/Feedback | `120:3529` | Link to a prefilled GitHub issue (`components/feedback-section.tsx`) |
| Site/Card link | `116:2175` | Card with one external link (`components/storybook-card.tsx`) |
| Site/Release (in the Changelog screen) | `145:5698` | One framed box per version (`components/release.tsx`) |
| Spec/Marker, Spec/Redline | `104:2077`, `104:2091` | Inside the exported spec images (SVG) |
| Code samples for the guides | `123:3038`, `123:3071`, `123:3104`, `131:4437`, `131:4476` | Real code in MDX, shown with `CodeBlock` |

## Rules the designs follow

- **Hero** on every docs page: category line (plain text, no links), title, excerpt, status (components only), "Updated …" from git, one external link (Storybook on component pages, Figma on foundation pages). No breadcrumbs.
- **Tabs:** components Guidelines · Styling · Code · Accessibility; foundations Overview · Guidelines · Tokens · Code; patterns and guides have none. Every tab ends with Feedback. No count badges. The tab labels show an underline today; that is a known library bug, not the design.
- **Code tab** of a component: only a card that opens Storybook. Props live in Storybook, never twice.
- **Changelog:** one framed box per version; groups New · Improved · Fixed; per change the text and on the right "Breaking" plus the package. Category and "Breaking" come from the changeset text ("New: …", "**Breaking:**"), read by `components/changelog.ts`.
- **Mobile (< 640 px):** tables stack, one block per row (the library does not do this yet; see the open issues). "On this page" becomes a disclosure button under the hero, the tab list scrolls sideways, `Site/Page header` and `Site/Feedback` use their Mobile layout.
- **Screen reader steps** on the Accessibility tab lead through the Playground (Icon, Pending, Disabled), so the same steps work for every component.
