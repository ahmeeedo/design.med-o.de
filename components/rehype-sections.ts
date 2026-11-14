/**
 * Rehype plugin for docs pages: puts each "## heading" and the content after it into a <section>, gives the heading
 * an id from its text (so /docs/components/button/styling#color reaches the Color section) and collects the heading
 * texts for the content schema check. Sections take the spacing rule `group` between them and `content` inside
 * (Figma 106:3625), and give the page an outline that "On this page" can follow later. Content before the first
 * heading becomes its own section.
 */
import type { Element, ElementContent, Root, RootContent } from 'hast';

export interface SectionsOptions {
  /** Receives the text of every "##" heading in document order. */
  headings?: string[];
}

const isHeading2 = (node: RootContent): node is Element => node.type === 'element' && node.tagName === 'h2';

const textOf = (node: ElementContent | Root): string => {
  if (node.type === 'text') return node.value;
  return 'children' in node ? (node.children as ElementContent[]).map(textOf).join('') : '';
};

/** "Light and Dark" → "light-and-dark". Letters and digits of every script stay, the rest becomes one hyphen. */
const slugOf = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '');

export function rehypeSections({ headings }: SectionsOptions = {}) {
  return (tree: Root) => {
    const kept: RootContent[] = [];
    const sections: Element[] = [];
    const ids = new Map<string, number>();
    let current: Element | undefined;

    for (const node of tree.children) {
      // MDX import and export statements and leading blank lines stay at the top level.
      const esm = (node as { type: string }).type === 'mdxjsEsm';
      const blank = node.type === 'text' && node.value.trim() === '';
      if (esm || (blank && !current)) {
        kept.push(node);
        continue;
      }
      if (!current || isHeading2(node)) {
        current = { type: 'element', tagName: 'section', properties: {}, children: [] };
        sections.push(current);
      }
      if (isHeading2(node)) {
        const text = textOf(node).replace(/\s+/g, ' ').trim();
        headings?.push(text);
        // A repeated heading gets a counter, so every id on the page stays unique.
        const slug = slugOf(text) || 'section';
        const seen = ids.get(slug) ?? 0;
        ids.set(slug, seen + 1);
        node.properties.id ??= seen ? `${slug}-${seen + 1}` : slug;
      }
      current.children.push(node as ElementContent);
    }

    tree.children = [...kept, ...sections];
  };
}
