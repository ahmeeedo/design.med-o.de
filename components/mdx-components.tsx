/**
 * How MDX elements render on docs pages: every section is medo-prose, so headings, paragraphs and spacing come from
 * the library; lists, links, inline code, code blocks and tables are the components. Fenced code is highlighted
 * here, in a server component at build time – no highlighting code reaches the browser. Pages start at "##": the
 * page title is the h1 of the hero.
 *
 * Authoring, for copying into new pages:
 *
 *   A code block. Optional after the language: title="file name" and lineNumbers.
 *     ```css title="main.css" lineNumbers
 *     @import "@med-o/design-tokens/css/tokens.css";
 *     ```
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
 *   density="compact" /> per page. A component gets <RelatedComponent component="Text Field" title="Field"
 *   subtitle="…" /> instead: its status badge and link come from the manifest, and a wrong name fails the build.
 *
 *   An image exported from Figma: ![Alt text that names the labeled parts](/spec/<page>/<name>.svg). Images live
 *   under public/spec/; their width and height are read from the SVG at build time, so the page does not jump.
 *
 *   Lists with markers and labels as in the Figma templates: <List type="check"> with <ListItem> for "When to use",
 *   Do and notes; <Badge tone="success" size="sm">Do</Badge> and <Badge tone="danger" size="sm">Don't</Badge> above
 *   the do and don't lists. Two lists side by side: <Grid minItemSize="var(--medo-size-width-lg)">.
 *
 *   References to other sites: <Stack gap="inline"> with one <Link href variant="standalone" size="md" external
 *   target="_blank"> per source.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Children, isValidElement, type ComponentPropsWithoutRef, type ReactElement, type ReactNode } from 'react';
import type { MDXComponents } from 'mdx/types';
import { Badge, Card, Code, CodeBlock, CodeBlockTabs, Grid, Image, Link, List, ListItem, Stack, StaticTable } from '@med-o/ui';
import { highlight } from '@med-o/ui/highlight';
import { proseComponents } from './mdx-prose';
import { RelatedComponent } from './related-component';

type Language = Parameters<typeof highlight>[1];

/** A fenced block as MDX hands it over: <pre> around <code class="language-…" metastring="…">. */
interface FencedCode {
  code: string;
  language: string;
  title?: string;
  lineNumbers: boolean;
}

type CodeElementProps = { className?: string; metastring?: string; children?: ReactNode };

function fencedCode(pre: ReactNode): FencedCode {
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

/** Images that pages may show: SVG exports from Figma under public/spec/. */
const SPEC_IMAGE = /^\/spec\/[\w-]+\/[\w-]+\.svg$/;

/** A Markdown image: a spec image from public/spec/, shown whole, at the size of its SVG. Anything else fails. */
async function SpecImage({ src, alt = '' }: ComponentPropsWithoutRef<'img'>) {
  if (typeof src !== 'string' || !SPEC_IMAGE.test(src)) throw new Error(`Image "${String(src)}": use an SVG under /spec/<page>/`);
  if (!alt.trim()) throw new Error(`Image "${src}" needs alt text that names its labeled parts`);
  const svg = await readFile(path.join(process.cwd(), 'public', src), 'utf8');
  const width = Number(/<svg[^>]*\swidth="(\d+)"/.exec(svg)?.[1]) || undefined;
  const height = Number(/<svg[^>]*\sheight="(\d+)"/.exec(svg)?.[1]) || undefined;
  return <Image src={src} alt={alt} width={width} height={height} ratio="original" fit="contain" radius="lg" />;
}

export const mdxComponents: MDXComponents = {
  ...proseComponents,
  pre: Pre,
  img: SpecImage,
  table: ({ children }) => <StaticTable variant="content">{children}</StaticTable>,
  th: cell('th', { scope: 'col' }),
  td: cell('td'),
  CodeTabs,
  Card,
  Grid,
  List,
  ListItem,
  Badge,
  Link,
  Stack,
  RelatedComponent,
};
