# Handoff: phase 1, templates

State on 2026-11-11. The concept (`docs/concept.md`) says what the site is and why. This file says where we stand, where the designs are and what phase 1 has to do.

## Where we stand

- **Phase 0: done.** The site shell builds, deploys a preview per pull request and passes lint, type check, axe, the keyboard path, the JavaScript budget (270 kB) and the link check.
- **Design system:** `@med-o/ui` and `@med-o/design-tokens` 0.15.0. Every gap that blocked phase 1 is closed in the design system: `SiteHeader` with centered links, free actions, `compactActions` and `menuContent`; `Button` with `href`; `NavItem` with `endIcon`; `OnThisPage`; `Code`; `QuickSearchTrigger`; `QuickSearch` with `isLoading`; option descriptions that pass axe.
- **Repos:**
  - Design system: https://github.com/ahmeeedo/medo-design_system, locally `~/Documents/GitHub/medo-design_system`.
  - Docs site: https://github.com/ahmeeedo/design.med-o.de (public), locally `C:\Programming\design.med-o.de\design.med-o.de`. This repo.

## Phase 1: templates

Goal: one finished page per page type on real content, before phase 2 moves the rest. Gate: every template is live on a preview, all checks are green, and you have approved the templates.

Pages: Guide Styling, Pattern Form, Foundation Colors, Component Button, Changelog, and the site pages Home, Showcase and Updates.

Proposed order. Agree on each step before you build it.

1. **Replace the workarounds with the components** (small, first):
   - Header and mobile menu: `SiteHeader` with `align="center"`, `actions`, `compactActions` and `menuContent`. Remove the own `<header>`, the rebuilt fullscreen menu and the copy of `useScrolled`.
   - "Give feedback": `Button` with `href`, `target="_blank"` and the external icon.
   - Resources: `NavItem` with `endIcon`.
   - Search: `QuickSearchTrigger` from 1280 px, the IconButton below; `isLoading` while Pagefind loads; results with excerpts as option descriptions.
   - Inline code in MDX: `Code`.
   - Measure the JavaScript budget again afterwards.
2. **CI: install Chromium without apt.** `npx playwright install --with-deps chromium` fails when the Ubuntu mirrors are down (run 43045391636: a11y and keyboard failed in the install step, not in a test). The runner image already has Chromium's libraries; only fonts are missing, and the site needs none of them. Use `npx playwright install chromium` and cache `~/.cache/ms-playwright` by the Playwright version.
3. **Prerequisite in the design system repo** (a separate pull request there, with a changeset):
   - The component manifest `@med-o/ui/manifest.json`, generated at build: per component its props with descriptions, status, Storybook id, Figma link and the `medo` story parameters (`usage`, `a11y` with `keyboard` and `screenReader`, `styling`). The Button page reads it.
   - The Playground controls for the docs (Variant, Size, Icon, Pending, Disabled) and the screen reader steps in `Button.stories.tsx` rewritten for the docs page: they lead through the Playground, so the same steps work for every component.
4. **Finish the docs layout** after Figma:
   - Hero: "Updated …" from git (CI checks out the full history: `fetch-depth: 0`).
   - Widths: hero and content share one column; the "On this page" rail sits to the right of both.
   - "On this page": rail from 1280 px, disclosure under the hero below.
   - Feedback section at the end of every page and tab; previous and next above the footer.
   - Tablet (768–1023 px): the sidebar in a Drawer behind "Menu" above the title.
5. **Content schemas:** the required sections per page type (concept, "Content model") in Zod. A page that misses one fails the build.
6. **The templates**, simple to complex:

| Step | Page | What is new |
|---|---|---|
| a | Guide · Styling | No tabs; code samples with `CodeBlockTabs` |
| b | Pattern · Form | Decision table; linked components with their status |
| c | Foundation · Colors | Four tabs; token tables from `@med-o/design-tokens`; the video |
| d | Component · Button | Four tabs; live Playground; Spec images; accessibility data from the manifest; Storybook card |
| e | Changelog | From the `CHANGELOG.md` of both packages; search and filters in the URL |
| f | Home, Showcase, Updates | Live examples; the carousel; releases; brand logos |

7. **Search:** results grouped by area; token names and props in the index.
8. **More checks:** screenshots of each template in Light, Dark and at 390 px; Lighthouse CI; a type check for the code samples; cspell; sitemap and Open Graph tags.

### Decisions

| Question | Decision |
|---|---|
| Tabs of component and foundation pages | Open. Proposal: one route per tab (`/docs/components/button/styling`). See below. |
| Playground | Live with `@med-o/ui`, no Storybook iframe |
| Language | English first; the language select comes with real German content, not in phase 1 |
| Storybook domain | The design system's `deploy-docs.yml` still deploys Storybook to design.med-o.de. It moves to storybook.med-o.de before the launch (phase 3). |

Tabs as routes or as `#fragment`: with one route per tab, each tab is its own page with its own title, search entry, "On this page" and section anchors (`/button/styling#color`). With `#styling`, all four tabs load as one page, the search finds "Button" four times without telling the tabs apart, and a fragment cannot point to a tab and a section at once. Next.js prefetches the tab routes, so switching stays instant.

### Design system issues phase 1 needs

- #56 `medo-prose` and #57 text color classes: the running text of every page. First.
- #54 filter field and #53 status badge in the sidebar.
- #58 label beside the Select: theme select at the bottom of the sidebar.
- #59 popover that hugs its content: the resources menu.
- #60 drawer without a visible header: the tablet navigation.
- #40 bundle: keeps the budget from growing.
- Likely new: a Carousel in code (Figma only today, for Showcase); `_Table cell` header and code cells; `Site/Release` shared by Updates and Changelog.

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
