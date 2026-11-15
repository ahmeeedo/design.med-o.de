/**
 * The prose MDX map: running text only – sections as medo-prose, links, lists and inline code. The legal pages use it
 * on its own, so they load none of the client code that docs pages need for code blocks, tables, cards and images;
 * Next ships every client component a page's server modules import, used or not. base.tsx starts from this one.
 */
import type { ComponentPropsWithoutRef } from 'react';
import type { MDXComponents } from 'mdx/types';
import { Code, Link, List, ListItem } from '@med-o/ui';

function Anchor({ href = '', children }: ComponentPropsWithoutRef<'a'>) {
  const external = /^https?:\/\//.test(href);
  return (
    <Link href={href} external={external} target={external ? '_blank' : undefined}>
      {children}
    </Link>
  );
}

export const proseComponents: MDXComponents = {
  section: ({ children }) => <section className="medo-prose">{children}</section>,
  a: Anchor,
  ul: ({ children }) => (
    <List type="bullet" size="md">
      {children}
    </List>
  ),
  ol: ({ children }) => (
    <List type="number" size="md">
      {children}
    </List>
  ),
  li: ({ children }) => <ListItem>{children}</ListItem>,
  code: Code,
};
