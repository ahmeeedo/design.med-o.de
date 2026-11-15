/**
 * The components MDX map: contentComponents (content.tsx) plus the blocks of component pages – the Playground, usage,
 * accessibility and the Storybook card from the package manifest, live examples, spec images, lists and badges. Only
 * the components route loads it, so the Playground's client code stays off the other areas (see base.tsx).
 * componentsComponentsFor(doc) binds the data blocks to the page's component (front matter `component`), so MDX
 * writes <Playground /> without naming it again, and it checks that front matter and manifest agree.
 *
 * Authoring, for copying into new component pages:
 *
 *   Data blocks, each under its own "##" or after the text it belongs to; they render nothing when the manifest has
 *   no data for them: <Playground /> · <UsageWhen /> (when, when not) · <UsageRules /> (do, don't) ·
 *   <A11yNotes /> (what med.o provides) · <KeyboardTable /> · <TestingStatus /> · <ScreenReaderSteps /> ·
 *   <StorybookCard />.
 *
 *   A live example: <Example><Button>Save changes</Button></Example>; with a label below: <ExampleTile label="Primary">;
 *   with a title and text next to it: <ExampleRow title="Primary" body="…">. Several tiles: <Grid>.
 *
 *   Spec images: ![Alt text that names the labeled parts](/spec/<component>/<name>.svg) (spec-image.tsx).
 *   Related components: <RelatedComponent component="Icon Button" subtitle="…" /> inside
 *   <Grid minItemSize="var(--medo-size-width-lg)">.
 */
import type { MDXComponents } from 'mdx/types';
import { Badge, Button, List, ListItem, Stack } from '@med-o/ui';
import { A11yNotes, KeyboardTable, ScreenReaderSteps, TestingStatus } from '../a11y-blocks';
import { Example, ExampleRow, ExampleTile } from '../component-example';
import type { DocPage } from '../docs-content';
import { getComponent, type ManifestComponent } from '../manifest';
import { Playground, type PlaygroundControl } from '../playground';
import { RelatedComponent } from '../related-component';
import { StorybookCard } from '../storybook-card';
import { UsageRules, UsageWhen } from '../usage-blocks';
import { contentComponents } from './content';
import { Paragraph, SpecImage } from './spec-image';

/** Components the Playground renders (components/playground.tsx). A page for another one fails until it is added. */
const PLAYGROUND_COMPONENTS = ['Button'];
const CHOICE = new Set(['inline-radio', 'radio', 'select']);

/** The manifest's controls as the Playground takes them; a kind it cannot render fails the build. */
function playgroundControls(entry: ManifestComponent): PlaygroundControl[] {
  return (entry.playground?.controls ?? []).map((control) => {
    if (CHOICE.has(control.control) && control.options?.length) {
      const options = control.options.map((option) => (option === null ? 'none' : String(option)));
      return { name: control.name, kind: 'choice', options, default: String(control.default ?? options[0]), mapping: control.mapping };
    }
    if (control.control === 'boolean') return { name: control.name, kind: 'boolean', default: control.default === true };
    throw new Error(
      `Playground for ${entry.name}: control "${control.name}" is of kind "${control.control}", which the Playground does not render yet (components/playground.tsx).`,
    );
  });
}

function PlaygroundBlock({ entry }: { entry: ManifestComponent }) {
  if (!entry.playground) return null;
  if (!PLAYGROUND_COMPONENTS.includes(entry.name)) {
    throw new Error(`Playground: ${entry.name} is not in PLAYGROUND_COMPONENTS (components/mdx/components.tsx and playground.tsx).`);
  }
  return <Playground component={entry.name} label={entry.name} controls={playgroundControls(entry)} />;
}

export const componentsComponents: MDXComponents = {
  ...contentComponents,
  p: Paragraph,
  img: SpecImage,
  List,
  ListItem,
  Badge,
  Stack,
  Button,
  Example,
  ExampleTile,
  ExampleRow,
  RelatedComponent,
};

/** The map for one component page: the data blocks bound to its manifest entry. */
export async function componentsComponentsFor(doc: DocPage): Promise<MDXComponents> {
  if (!doc.component) throw new Error(`${doc.file.path}: a component page needs \`component\` in its front matter`);
  const entry = await getComponent(doc.component);
  const problems = [
    doc.status && doc.status !== entry.status ? `status is "${doc.status}", the manifest says "${entry.status}"` : '',
    doc.storybookId && doc.storybookId !== entry.storybookId ? `storybookId is "${doc.storybookId}", the manifest says "${entry.storybookId}"` : '',
  ].filter(Boolean);
  if (problems.length) throw new Error(`${doc.file.path}: front matter and manifest disagree – ${problems.join('; ')}`);

  return {
    ...componentsComponents,
    Playground: () => <PlaygroundBlock entry={entry} />,
    UsageWhen: () => <UsageWhen entry={entry} />,
    UsageRules: () => <UsageRules entry={entry} />,
    A11yNotes: () => <A11yNotes entry={entry} />,
    KeyboardTable: () => <KeyboardTable entry={entry} />,
    TestingStatus: () => <TestingStatus entry={entry} />,
    ScreenReaderSteps: () => <ScreenReaderSteps entry={entry} />,
    StorybookCard: () => <StorybookCard entry={entry} />,
  };
}
