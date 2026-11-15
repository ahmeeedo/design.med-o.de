/**
 * Rehype plugin for docs pages: puts each "## heading" and the content after it into a <section>, gives the heading
 * an id from its text (so /docs/components/button/styling#color reaches the Color section) and collects the heading
 * texts for the content schema check and, with their ids, for "On this page". Sections take the spacing rule `group` between them and `content` inside
 * (Figma 106:3625). Content before the first heading becomes its own section.
 * A data block (a component named in `blocks`, such as the Changelog's release list) stays outside the sections: it
 * brings its own headings, which the page adds to its outline.
 */
import type { Element, ElementContent, Root, RootContent } from 'hast';

export interface SectionsOptions {
  /** Receives the text of every "##" heading in document order. */
  headings?: string[];
  /** Receives the id and the text of every "##" heading in document order. */
  outline?: { id: string; label: string }[];
  /** Names of MDX components that are data blocks: kept outside the sections. */
  blocks?: readonly string[];
  /** Receives the name of every data block the page uses, in document order. */
  usedBlocks?: string[];
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

/** The component name of an MDX JSX block (<ReleaseList />), or undefined for any other node. */
const blockName = (node: RootContent) =>
  (node as { type: string }).type === 'mdxJsxFlowElement' ? ((node as { name?: string | null }).name ?? undefined) : undefined;

export function rehypeSections({ headings, outline, blocks = [], usedBlocks }: SectionsOptions = {}) {
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
      // A data block ends the current section and stands on its own, in document order.
      const name = blockName(node);
      if (name && blocks.includes(name)) {
        usedBlocks?.push(name);
        sections.push(node as Element);
        current = undefined;
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
        outline?.push({ id: String(node.properties.id), label: text });
      }
      current.children.push(node as ElementContent);
    }

    tree.children = [...kept, ...sections];
  };
}
