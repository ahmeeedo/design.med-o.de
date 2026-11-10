/**
 * How MDX elements render on docs pages: text styles from the medo-text-* classes, lists, links and code blocks
 * from @med-o/ui. Fenced code is highlighted here, in a server component at build time – no highlighting code
 * reaches the browser. Pages start at "##": the page title is the h1 of the hero.
 */
import { isValidElement, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import type { MDXComponents } from 'mdx/types';
import { CodeBlock, Link, List, ListItem, Stack } from '@med-o/ui';
import { highlight } from '@med-o/ui/highlight';

type Language = Parameters<typeof highlight>[1];

/** A fenced code block: <pre><code class="language-…">. */
async function Pre({ children }: ComponentPropsWithoutRef<'pre'>) {
  const code = isValidElement<{ className?: string; children?: ReactNode }>(children) ? children.props : undefined;
  const language = /language-([\w-]+)/.exec(code?.className ?? '')?.[1] ?? 'text';
  const text = typeof code?.children === 'string' ? code.children.replace(/\n$/, '') : '';

  return (
    <div translate="no">
      <CodeBlock
        code={text}
        language={language}
        tokens={await highlight(text, language as Language)}
        copyable
        aria-label={`Code example (${language})`}
      />
    </div>
  );
}

function Anchor({ href = '', children }: ComponentPropsWithoutRef<'a'>) {
  const external = /^https?:\/\//.test(href);
  return (
    <Link href={href} external={external} target={external ? '_blank' : undefined}>
      {children}
    </Link>
  );
}

export const mdxComponents: MDXComponents = {
  section: ({ children }) => (
    <Stack as="section" gap="content">
      {children}
    </Stack>
  ),
  h2: (props) => <h2 className="medo-text-heading-lg" {...props} />,
  h3: (props) => <h3 className="medo-text-heading-sm" {...props} />,
  p: (props) => <p className="medo-text-body-md" {...props} />,
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
  pre: Pre,
};
