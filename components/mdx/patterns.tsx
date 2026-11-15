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
import type { MDXComponents } from 'mdx/types';
import { Badge, Link, List, ListItem, Stack } from '@med-o/ui';
import { RelatedComponent } from '../related-component';
import { contentComponents } from './content';
import { Paragraph, SpecImage } from './spec-image';

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
