/**
 * The foundations MDX map: contentComponents (content.tsx) plus the blocks of foundation pages – token tables,
 * color samples, palette ramps, images and the lists and badges of the guidelines. Only the foundations route loads
 * it, so the client code of Image stays off the other areas (see base.tsx for the convention).
 *
 * Authoring, for copying into new pages:
 *
 *   A token table, one per section on the Tokens tab: <TokenTable groups={['surface', 'overlay']} label="Surface
 *   tokens" />. Groups are the token docs groups (surface, text, border, focus, action, state, feedback, avatar,
 *   code, shadow, or a palette family such as slate); only color tokens are listed. Usage comes from the token's
 *   description in @med-o/design-tokens, so it is never written here.
 *
 *   A surface with its text: <ColorSample surface="surface/brand-bold" title="New in 0.10" titleColor="text/on-brand"
 *   body="…" bodyColor="text/on-brand-secondary" caption="surface/brand-bold · text/on-brand" />. A principle tile:
 *   variant="tile" with titleAs="h3" and chips={['slate/50', 'slate/900']}. A do or don't sample:
 *   variant="example" with titleColor for the line's color; add `failing` to a don't sample whose pair fails contrast on
 *   purpose (the a11y test then skips its contrast check). Unknown token names fail the build.
 *
 *   A palette family: <PaletteRamp group="brand" label="Brand" alias="primary" />.
 *
 *   Steps in a row with arrows: <ColorFlow> around the blocks (Cards).
 *
 *   An image exported from Figma: <Image src="/spec/<page>/<name>.svg" alt="…" width={824} height={268}
 *   ratio="original" fit="contain" radius="lg" />, with a caption: wrap it in <Figure caption="…">. An image in the
 *   first screen of a page, which is then its largest element, gets `priority`: it loads at once instead of lazily.
 */
import type { MDXComponents } from 'mdx/types';
import { Badge, Figure, Image, List, ListItem, Stack } from '@med-o/ui';
import { ColorFlow, ColorSample, PaletteRamp } from '../color-samples';
import { TokenTable } from '../token-tables';
import { contentComponents } from './content';

export const foundationsComponents: MDXComponents = {
  ...contentComponents,
  TokenTable,
  ColorSample,
  PaletteRamp,
  ColorFlow,
  Figure,
  Image,
  Badge,
  List,
  ListItem,
  Stack,
};
