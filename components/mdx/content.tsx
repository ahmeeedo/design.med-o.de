/**
 * The content MDX map: baseComponents (base.tsx) plus the blocks of long-form docs – code in tabs, tables, cards and
 * grids. Guides use it; the area maps of patterns, foundations and components build on it (see base.tsx for the
 * convention). Code is highlighted at build time, as in base.tsx.
 *
 * Authoring, for copying into new pages:
 *
 *   The same code in variants (CodeBlockTabs, 2–4 tabs): fenced blocks inside <CodeTabs>, each titled with its tab
 *   label. `label` names the tab list for screen readers. Keep a blank line after the opening and before the closing
 *   tag, so the blocks stay Markdown – real fenced code that the sample check can find.
 *     <CodeTabs label="Package manager">
 *
 *     ```bash title="npm"
 *     npm install @med-o/ui
 *     ```
 *
 *     ```bash title="pnpm"
 *     pnpm add @med-o/ui
 *     ```
 *
 *     </CodeTabs>
 *
 *   A table: a Markdown table renders as StaticTable variant="content". A cell that holds exactly one inline code
 *   (`bg-surface-default`) gets the code cell style, medo-table__cell--code: code type, one line – for one token
 *   name, ID or key. Write a list of several values as separate inline code (`gap-inline`, `gap-content`): it wraps
 *   on small screens, where a one-line code cell would squeeze the other columns.
 *
 *   Related pages: <Grid minItemSize="var(--medo-size-width-lg)"> with one <Card title subtitle href
 *   density="compact" /> per page.
 */
import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import type { MDXComponents } from 'mdx/types';
import { Card, Code, CodeBlockTabs, Grid, StaticTable } from '@med-o/ui';
import { highlight } from '@med-o/ui/highlight';
import { baseComponents, fencedCode, type Language } from './base';

/** Fenced blocks as tabs of one CodeBlockTabs; each block's title is its tab label. A wrong group fails the build. */
async function CodeTabs({ label, children }: { label: string; children: ReactNode }) {
  const blocks = Children.toArray(children).filter(isValidElement).map(fencedCode);
  const problem =
    blocks.length < 2 || blocks.length > 4
      ? `has ${blocks.length} code blocks; it needs 2 to 4`
      : blocks.some((block) => !block.title)
        ? 'needs title="…" on every code block – it is the tab label'
        : undefined;
  if (problem) throw new Error(`<CodeTabs label="${label}"> ${problem}`);

  const items = await Promise.all(
    blocks.map(async (block, index) => ({
      id: `${index}-${block.title!.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      label: block.title!,
      code: block.code,
      language: block.language,
      tokens: await highlight(block.code, block.language as Language),
    })),
  );

  return (
    <div translate="no">
      <CodeBlockTabs aria-label={label} items={items} lineNumbers={blocks.some((block) => block.lineNumbers)} copyable />
    </div>
  );
}

/** A table cell: one that holds only inline code shows it as a code cell, without the inline code chip. */
function cell(Tag: 'th' | 'td', extra: { scope?: 'col' } = {}) {
  function TableCell({ children }: { children?: ReactNode }) {
    const parts = Children.toArray(children).filter((part) => typeof part !== 'string' || part.trim() !== '');
    const only = parts.length === 1 ? parts[0] : undefined;
    if (isValidElement<{ children: string }>(only) && only.type === Code) {
      return (
        <Tag {...extra} className="medo-table__cell--code">
          {(only as ReactElement<{ children: string }>).props.children}
        </Tag>
      );
    }
    return <Tag {...extra}>{children}</Tag>;
  }
  return TableCell;
}

export const contentComponents: MDXComponents = {
  ...baseComponents,
  table: ({ children }) => <StaticTable variant="content">{children}</StaticTable>,
  th: cell('th', { scope: 'col' }),
  td: cell('td'),
  CodeTabs,
  Card,
  Grid,
};
