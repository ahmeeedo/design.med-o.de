/**
 * Usage blocks of component pages, from the package manifest (`usage` in the stories): when to use and when not, side
 * by side under Overview, and the do and don't lists under Content (Figma Component · Guidelines 106:3625). Nothing
 * here is written in MDX, so Storybook and the site show the same rules. A missing list renders nothing; a block
 * with no list at all renders nothing either, so pages of components with less data still build.
 */
import { Grid, List, ListItem } from '@med-o/ui';
import type { ManifestComponent } from './manifest';
import { RichText } from './rich-text';

function Items({ items, type }: { items: string[]; type: 'check' | 'bullet' }) {
  return (
    <List type={type} size="md">
      {items.map((item) => (
        <ListItem key={item}>
          <RichText text={item} />
        </ListItem>
      ))}
    </List>
  );
}

/** "When to use" (check list) and "When not to use" next to it. The library List has no cross marker yet. */
export function UsageWhen({ entry }: { entry: ManifestComponent }) {
  const { when = [], whenNot = [] } = entry.usage;
  if (!when.length && !whenNot.length) return null;
  return (
    <Grid minItemSize="var(--medo-size-width-lg)">
      {when.length > 0 && (
        <div className="medo-stack medo-gap-inline">
          <h3 className="medo-text-heading-sm">When to use</h3>
          <Items items={when} type="check" />
        </div>
      )}
      {whenNot.length > 0 && (
        <div className="medo-stack medo-gap-inline">
          <h3 className="medo-text-heading-sm">When not to use</h3>
          <Items items={whenNot} type="bullet" />
        </div>
      )}
    </Grid>
  );
}

/** The do list (check) and the don't list next to it. */
export function UsageRules({ entry }: { entry: ManifestComponent }) {
  const { do: dos = [], dont = [] } = entry.usage;
  if (!dos.length && !dont.length) return null;
  return (
    <Grid minItemSize="var(--medo-size-width-lg)">
      {dos.length > 0 && <Items items={dos} type="check" />}
      {dont.length > 0 && <Items items={dont} type="bullet" />}
    </Grid>
  );
}
