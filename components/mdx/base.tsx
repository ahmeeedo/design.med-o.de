/**
 * The base MDX map: how plain Markdown renders on a page. Every section is medo-prose, so headings, paragraphs and
 * spacing come from the library; lists, links, inline code and code blocks are the components. Fenced code is
 * highlighted here, in a server component at build time – no highlighting code reaches the browser. Pages start at
 * "##": the page title is the h1 of the hero.
 *
 * MDX maps, one file each in components/mdx/. A route passes one map to DocsPage, and Next ships the client code of
 * every component in that map on every page of the route – so each map holds only what its pages use:
 *   prose.tsx        proseComponents: running text only, no code blocks. The legal pages.
 *   base.tsx         baseComponents: prose plus code blocks. Overview pages.
 *   content.tsx      contentComponents: base plus code tabs, tables, cards and grids. Guides.
 *   <area>.tsx       <area>Components: content plus the blocks of one area, added with the area's first page –
 *                    patterns.tsx (spec images, related components, lists and badges), foundations.tsx (token tables),
 *                    components.tsx (Playground and the component blocks). Spread the map it builds on, then add.
 *
 * Authoring, for copying into new pages:
 *
 *   A code block. Optional after the language: title="file name" and lineNumbers.
 *     ```css title="main.css" lineNumbers
 *     @import "@med-o/design-tokens/css/tokens.css";
 *     ```
 */
import { isValidElement, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import type { MDXComponents } from 'mdx/types';
import { CodeBlock } from '@med-o/ui';
import { highlight } from '@med-o/ui/highlight';
import { proseComponents } from './prose';

export type Language = Parameters<typeof highlight>[1];

/** A fenced block as MDX hands it over: <pre> around <code class="language-…" metastring="…">. */
export interface FencedCode {
  code: string;
  language: string;
  title?: string;
  lineNumbers: boolean;
}

type CodeElementProps = { className?: string; metastring?: string; children?: ReactNode };

/** Reads code, language and the meta options (title, lineNumbers) of one fenced block. */
export function fencedCode(pre: ReactNode): FencedCode {
  const element = isValidElement<{ children?: ReactNode }>(pre) ? pre.props.children : undefined;
  const props = isValidElement<CodeElementProps>(element) ? element.props : {};
  const meta = props.metastring ?? '';
  return {
    code: typeof props.children === 'string' ? props.children.replace(/\n$/, '') : '',
    language: /language-([\w-]+)/.exec(props.className ?? '')?.[1] ?? 'text',
    title: /(?:^|\s)title="([^"]*)"/.exec(meta)?.[1],
    lineNumbers: /(?:^|\s)lineNumbers(?:\s|$)/.test(meta),
  };
}

/** A fenced code block. */
async function Pre({ children }: ComponentPropsWithoutRef<'pre'>) {
  const { code, language, title, lineNumbers } = fencedCode(<pre>{children}</pre>);

  return (
    <div translate="no">
      <CodeBlock
        code={code}
        language={language}
        tokens={await highlight(code, language as Language)}
        title={title}
        lineNumbers={lineNumbers}
        copyable
        aria-label={title ? undefined : `Code example (${language})`}
      />
    </div>
  );
}

export const baseComponents: MDXComponents = {
  ...proseComponents,
  pre: Pre,
};
