/**
 * Rehype plugin for docs pages: puts each "## heading" and the content after it into a <section>.
 * Sections take the spacing rule `group` between them and `content` inside (Figma 106:3625), and give the page
 * an outline that "On this page" can follow later. Content before the first heading becomes its own section.
 */
import type { Element, ElementContent, Root, RootContent } from 'hast';

const isHeading2 = (node: RootContent) => node.type === 'element' && node.tagName === 'h2';

export function rehypeSections() {
  return (tree: Root) => {
    const kept: RootContent[] = [];
    const sections: Element[] = [];
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
      current.children.push(node as ElementContent);
    }

    tree.children = [...kept, ...sections];
  };
}
