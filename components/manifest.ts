/**
 * The component manifest of @med-o/ui (dist/manifest.json, written by the package's build-manifest.mjs): status,
 * Storybook id, Figma link, props, Playground controls and the docs data of the stories (usage, a11y, styling) for
 * every component with a docs page. Read once at build time from node_modules, so the site shows what the installed
 * version ships. The schema is loose: unknown keys pass, the keys the templates render are required, so a renamed
 * field fails the build here, not in a template. No React; runs in server components and scripts only.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';

const FILE = 'node_modules/@med-o/ui/dist/manifest.json';

/** [key or class, what it does] – the pair shape the stories use for keyboard, screen reader steps and classes. */
const pair = z.tuple([z.string(), z.string()]);
const strings = z.array(z.string());

const Prop = z.looseObject({
  name: z.string(),
  /** Missing for a few props from React Aria that docgen cannot see. */
  type: z.string().optional(),
  required: z.boolean(),
  default: z.string().optional(),
  description: z.string(),
});

const Control = z.looseObject({
  name: z.string(),
  /** Storybook control kind: inline-radio, select, boolean, text, number, range, check, object. */
  control: z.string(),
  default: z.union([z.string(), z.boolean(), z.number()]).optional(),
  options: z.array(z.union([z.string(), z.number(), z.null()])).optional(),
  /** Plain-value mapping of an option to a prop (icon → startIcon); mappings with elements are left out. */
  mapping: z.record(z.string(), z.string()).optional(),
  description: z.string().optional(),
});

const ScreenReaderResult = z.looseObject({
  reader: z.string(),
  versions: z.string(),
  date: z.string(),
  result: z.string(),
  issue: z.number().optional(),
});

const Component = z.looseObject({
  name: z.string(),
  /** Storybook title, such as Components/Actions/Button. */
  title: z.string(),
  status: z.enum(['experimental', 'beta', 'stable', 'deprecated']),
  storybookId: z.string(),
  figma: z.url().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  props: z.array(Prop),
  /** Missing when no story has a control (Form). */
  playground: z.looseObject({ controls: z.array(Control) }).optional(),
  usage: z.looseObject({ when: strings.optional(), whenNot: strings.optional(), do: strings.optional(), dont: strings.optional() }),
  a11y: z.looseObject({
    keyboard: z.array(pair).optional(),
    notes: strings.optional(),
    screenReader: z.looseObject({ steps: z.array(pair).optional(), tested: z.array(ScreenReaderResult).optional() }).optional(),
  }),
  styling: z.looseObject({ classes: z.array(pair).optional(), states: strings.optional() }),
});

const Manifest = z.looseObject({
  package: z.literal('@med-o/ui'),
  version: z.string(),
  components: z.array(Component),
});

export type ManifestComponent = z.infer<typeof Component>;
export type ManifestProp = z.infer<typeof Prop>;
export type PlaygroundControl = z.infer<typeof Control>;
export type ComponentStatus = ManifestComponent['status'];
export type Manifest = z.infer<typeof Manifest>;

async function load(): Promise<Manifest> {
  const json = JSON.parse(await readFile(path.join(process.cwd(), FILE), 'utf8'));
  const result = Manifest.safeParse(json);
  if (!result.success) {
    const problems = result.error.issues.map((issue) => `  ${issue.path.join('.') || 'manifest'} – ${issue.message}`);
    throw new Error(`${FILE} does not match the manifest schema:\n${problems.join('\n')}`);
  }
  return result.data;
}

let cache: Promise<Manifest> | undefined;

/** The whole manifest with its package version. Read once per process. */
export function getManifest(): Promise<Manifest> {
  cache ??= load();
  return cache;
}

/** Every component in the manifest, A–Z as the package writes them. */
export async function getComponents(): Promise<ManifestComponent[]> {
  return (await getManifest()).components;
}

/** One component by its name (the last part of the Storybook title), or a build error naming it and the file. */
export async function getComponent(name: string): Promise<ManifestComponent> {
  const components = await getComponents();
  const component = components.find((c) => c.name === name);
  if (!component) {
    throw new Error(`Component "${name}" is not in ${FILE} (${components.length} components: ${components.map((c) => c.name).join(', ')})`);
  }
  return component;
}

/** The docs page of a component in Storybook. */
export const storybookUrl = (storybookId: string) => `https://storybook.med-o.de/?path=/docs/${storybookId}`;
