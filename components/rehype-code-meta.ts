/**
 * Rehype plugin for docs pages: keeps the meta string of a fenced code block, the text after the language
 * (```css title="main.css" lineNumbers). The Markdown-to-HTML step stores it only in the node's data, which the MDX
 * compiler drops, so this plugin copies it to a `metastring` property that the code block components in
 * mdx-components.tsx read.
 */
import type { Element, Root, RootContent } from 'hast';

/** Walks every node with children, MDX JSX elements included, so code blocks inside <CodeTabs> are found too. */
function visit(node: Root | RootContent) {
  if (node.type === 'element' && node.tagName === 'code') {
    const meta = (node.data as { meta?: string } | undefined)?.meta;
    if (meta) (node as Element).properties.metastring = meta;
  }
  if ('children' in node) for (const child of node.children as RootContent[]) visit(child);
}

export function rehypeCodeMeta() {
  return (tree: Root) => visit(tree);
}
