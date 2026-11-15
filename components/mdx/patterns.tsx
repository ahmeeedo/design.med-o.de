/**
 * The pattern MDX map: content plus what pattern pages show – spec images exported from Figma, related components
 * with their status, check lists with Do and Don't badges, and reference links. Only the patterns route uses it, so
 * the image and card code stays off the other areas.
 *
 * Authoring, for copying into new pattern pages:
 *
 *   Related components: <RelatedComponent component="Text Field" title="Field" subtitle="…" /> inside
 *   <Grid minItemSize="var(--medo-size-width-lg)">. Status badge and link come from the manifest; a wrong name fails
 *   the build. A related page that is not a component stays a <Card title subtitle href density="compact" />.
 *
 *   An image exported from Figma: ![Alt text that names the labeled parts](/spec/<page>/<name>.svg), on a line of its
 *   own. Images live under public/spec/; their width and height are read from the SVG at build time, so the page does
 *   not jump. Markdown wraps a lone image in a paragraph, but the image is a block (a div) that may not sit inside a
 *   <p>: the browser would split the paragraph and the page would not hydrate. So that paragraph renders the image
 *   alone, and an image inside running text fails the build.
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
import { Children, isValidElement, type ComponentPropsWithoutRef } from 'react';
import type { MDXComponents } from 'mdx/types';
import { Badge, Image, Link, List, ListItem, Stack } from '@med-o/ui';
import { RelatedComponent } from '../related-component';
import { contentComponents } from './content';

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

/** A paragraph; one that holds only a spec image renders the image without the <p> (see the header). */
function Paragraph({ children }: ComponentPropsWithoutRef<'p'>) {
  const parts = Children.toArray(children).filter((part) => typeof part !== 'string' || part.trim() !== '');
  const images = parts.filter((part) => isValidElement(part) && part.type === SpecImage);
  if (images.length === 0) return <p>{children}</p>;
  if (parts.length === 1) return images[0];
  const src = isValidElement<{ src?: string }>(images[0]) ? images[0].props.src : '';
  throw new Error(`Image "${src}" sits inside running text; put it on a line of its own`);
}

export const patternsComponents: MDXComponents = {
  ...contentComponents,
  p: Paragraph,
  img: SpecImage,
  List,
  ListItem,
  Badge,
  Link,
  Stack,
  RelatedComponent,
};
