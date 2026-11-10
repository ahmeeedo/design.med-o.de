# Handoff: from design to phase 0

State on 2026-11-10. The concept (`docs/concept.md`) says what the site is and why. This file says where we stand, where the designs are and what phase 0 has to do.

## Where we stand

- **Design: done and approved.** All page types are designed in Figma and signed off. No more mobile screens are needed – the mobile rules below cover the rest.
- **Design system:** `@med-o/ui` and `@med-o/design-tokens` 0.10.0 are on npm (released 2026-11-09, with `CodeBlock`, `CodeBlockTabs`, `@med-o/ui/highlight` and the `code/*` tokens).
- **Repos:**
  - Design system: https://github.com/ahmeeedo/medo-design_system, locally `~/Documents/GitHub/medo-design_system`. Storybook, tests and the release workflow live there.
  - Docs site: https://github.com/ahmeeedo/design.med-o.de (public), locally `C:\Programming\design.med-o.de\design.med-o.de`. This repo.

## Phase 0: set up

Goal: an empty but complete site skeleton that builds, deploys and proves the stack. No content pages yet – they come in phase 1.

Proposed order. Agree on each step before you build it.

1. **Prerequisites in the design system repo** (a separate pull request there, with a changeset):
   - `CHANGELOG.md` is **not** in the npm packages today (`files` is `["dist", "src/**/*.css"]` and `["dist", "src"]`). The Updates and Changelog pages read the changelogs from the installed packages, so add `CHANGELOG.md` to `files` of both packages.
   - The component manifest `@med-o/ui/manifest.json` (decided, generated at build). Per component: props with descriptions, status, Storybook id, Figma link and the `medo` story parameters (`usage`, `a11y` incl. `screenReader`, `styling`). It can wait until phase 1 if phase 0 does not need it – decide together.
2. **Next.js 16** with the App Router, TypeScript and `output: 'export'`. React 19.
3. **Install from npm:** `@med-o/ui`, `@med-o/design-tokens`, `shiki`, `@fontsource/dm-sans`, `@fontsource/dm-mono`. Import `@med-o/design-tokens/css/tokens.css` and `@med-o/ui/styles.css` once in the root layout. `@med-o/ui` is marked `"use client"`: pages stay server components, interactive parts are client components.
   - Reference for a working Next.js setup: `scripts/test-consumers.mjs` in the design system repo builds a fresh Next.js app with the packages in CI.
4. **Content pipeline:** MDX with typed front matter (Zod), read at build time. Code highlighting with `highlight()` from `@med-o/ui/highlight` at build time, shown with `CodeBlock`.
5. **Site shell** from library components: header, footer, docs layout with sidebar and "On this page" rail, theme (`data-theme`, follows the system), skip link. Gaps go to the design system as issues (list below).
6. **Search:** Pagefind 1.6, indexed after `next build`.
7. **Checks in CI:** lint, type check, build; Playwright + axe on the built pages; JavaScript budget 100 kB per page; link check. Lighthouse and visual screenshots can follow in phase 1.
8. **Deploy:** the same way as Storybook today (`.github/workflows/deploy-docs.yml` in the design system repo): Docker image with nginx and the static files → GitHub Container Registry → Coolify webhook. One preview per pull request. The new repo needs its own deploy token or webhook. The Coolify token expires on 2026-12-06.
9. **Release link:** a release of the design system opens a pull request here (dependency update), so the site never shows a version that does not exist.

Gate of phase 0: the skeleton is live on a preview URL, all checks are green, and you have approved the stack.

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
| Site/Header | `10:2250` | Site shell; needs the SiteHeader gap below |
| Site/Sidebar (one variant per docs area) | `123:4710` | SideNav from `@med-o/ui` |
| Site/Footer | `76:3950` | Site shell |
| Site/Page header (Type Component / Foundation / None, Tab, Layout) | `104:2063` | Hero box + Tabs from `@med-o/ui` |
| Site/Feedback | `120:3529` | Link to a prefilled GitHub issue |
| Site/Card link | `116:2175` | Card with one external link |
| Spec/Marker, Spec/Redline | `104:2077`, `104:2091` | Images on Guidelines and Styling tabs (SVG) |
| Code samples for the guides | `123:3038`, `123:3071`, `123:3104`, `131:4437`, `131:4476` | Real code in MDX, shown with `CodeBlock` |

## Rules the designs follow

- **Hero** on every docs page: category line (plain text, no links), title, excerpt, status (components only), "Updated …" from git, one external link (Storybook on component pages, Figma on foundation pages). No breadcrumbs.
- **Tabs:** components Guidelines · Styling · Code · Accessibility; foundations Overview · Guidelines · Tokens · Code; patterns and guides have none. Every tab ends with Feedback.
- **Code tab** of a component: only a card that opens Storybook. Props live in Storybook, never twice.
- **Changelog:** one framed box per release; groups New · Improved · Fixed; per change the text and on the right "Breaking" plus the package. Category and "Breaking" come from the changeset text ("New: …", "**Breaking:**"), see `apps/storybook/src/docs-blocks/Changelog.tsx` in the design system repo for the parser that exists today.
- **Mobile (< 640 px):** tables stack (one block per row), "On this page" becomes a disclosure button under the hero, the tab list scrolls sideways, `Site/Page header` and `Site/Feedback` use their Mobile layout.
- **Screen reader steps** on the Accessibility tab lead through the Playground (switches Icon, Pending, Disabled), so the same steps work for every component.

## Open work outside phase 0

- Design system: rewrite `screenReader.steps` in `Button.stories.tsx` for the docs page (Playground instead of Storybook headings) – together with the Playground in phase 1.
- Design system gaps for the site: SiteHeader with centered links and an actions slot; Input trailing slot for "⌘K"; SideNav filter field; "On this page" as a component; `_Table cell` header and code cells; later `Site/Release` as a component shared by Updates and Changelog.
- Analytics: none at launch.
