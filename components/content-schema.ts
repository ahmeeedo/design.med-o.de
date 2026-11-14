/**
 * The page model of the docs: the tabs of component and foundation pages, and the "##" sections every page type
 * must have, in this order (docs/concept.md § Content model). checkSections runs at build time on the headings that
 * rehype-sections collects and throws for a missing or misplaced section, so a broken page never ships.
 * Sections a template renders from package data are marked fromData; they are not written in MDX. Feedback closes
 * every page and tab through the template, so it is not listed here.
 * No React and no imports: scripts/check-content.mjs loads this file directly in Node.
 */

export type PageType = 'guide' | 'pattern' | 'foundation' | 'component' | 'overview';

/** Page types whose content is a folder with one MDX file per tab. The first tab is the page route itself. */
export type TabbedType = 'component' | 'foundation';

export interface Tab {
  /** The last part of the URL and the file name without .mdx. */
  slug: string;
  label: string;
}

export const TABS: Record<TabbedType, readonly Tab[]> = {
  component: [
    { slug: 'guidelines', label: 'Guidelines' },
    { slug: 'styling', label: 'Styling' },
    { slug: 'code', label: 'Code' },
    { slug: 'accessibility', label: 'Accessibility' },
  ],
  foundation: [
    { slug: 'overview', label: 'Overview' },
    { slug: 'guidelines', label: 'Guidelines' },
    { slug: 'tokens', label: 'Tokens' },
    { slug: 'code', label: 'Code' },
  ],
};

export const isTabbed = (type: PageType): type is TabbedType => type in TABS;

export interface Section {
  /** The "##" text in sentence case, as written in MDX. */
  heading: string;
  /** Rendered by the template from package data; never written in MDX and never required there. */
  fromData?: true;
}

/** The sections of one page or tab: a fixed list, or free headings with at least one section. */
export type SectionRule = { sections: readonly Section[] } | { free: true };

const sections = (...headings: string[]): SectionRule => ({ sections: headings.map((heading) => ({ heading })) });
const fromData = (heading: string): Section => ({ heading, fromData: true });
const free: SectionRule = { free: true };

/** Keyed by page type, or by "type/tab" for the tabbed types. */
export const CONTENT_SCHEMA: Readonly<Record<string, SectionRule>> = {
  overview: free,
  guide: sections('Goal', 'Steps', 'Examples', 'Pitfalls', 'Related'),
  pattern: sections(
    'Overview',
    'Anatomy',
    'Building it',
    'Behavior',
    'Content',
    'Accessibility',
    'Rules',
    'Related',
    'References',
  ),
  'foundation/overview': free,
  'foundation/guidelines': sections('How to combine', 'Light and Dark', "Do and don't", 'Related'),
  'foundation/tokens': { sections: [fromData('One section per token group')] },
  'foundation/code': sections('CSS variables', 'Tailwind classes', 'JavaScript'),
  'component/guidelines': {
    sections: [
      fromData('Playground'),
      { heading: 'Overview' },
      { heading: 'Formatting' },
      { heading: 'Content' },
      { heading: 'Variants' },
      { heading: 'Related' },
    ],
  },
  'component/styling': sections('Color', 'Typography', 'Structure', 'Sizes'),
  'component/code': { sections: [fromData('React')] },
  'component/accessibility': sections(
    'What med.o provides',
    'Keyboard',
    'Design recommendations',
    'Development recommendations',
    'Testing status',
  ),
};

const invalid = (file: string, problem: string) => new Error(`Docs content is invalid:\n  ${file}: ${problem}`);

/**
 * Throws when the "##" headings of a page or tab do not satisfy its rule: a required section is missing, the
 * required ones are not in their relative order, or a free page has no section. Extra sections are allowed anywhere.
 * `file` is the content path for the message; `headings` are the heading texts in document order.
 */
export function checkSections(file: string, type: PageType, tab: string | undefined, headings: readonly string[]): void {
  const key = isTabbed(type) ? `${type}/${tab}` : type;
  const rule = CONTENT_SCHEMA[key];
  if (!rule) throw invalid(file, `no content schema for ${isTabbed(type) ? `tab "${tab}" of a ${type} page` : `type "${type}"`}`);

  const found = headings.map((h) => h.trim());
  if ('free' in rule) {
    if (found.length === 0) throw invalid(file, 'needs at least one "##" section');
    return;
  }

  const required = rule.sections.filter((s) => !s.fromData).map((s) => s.heading);
  const order = `expected order: ${required.join(' · ')}; found: ${found.join(' · ') || 'no sections'}`;

  const missing = required.filter((heading) => !found.includes(heading));
  if (missing.length) {
    const label = missing.length === 1 ? 'missing section' : 'missing sections';
    throw invalid(file, `${label} ${missing.map((m) => `"${m}"`).join(', ')} (${order})`);
  }

  let next = 0;
  for (const heading of found) {
    if (heading === required[next]) next += 1;
  }
  if (next < required.length) throw invalid(file, `section "${required[next]}" is out of order (${order})`);
}
