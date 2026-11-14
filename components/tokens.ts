/**
 * The token documentation of @med-o/design-tokens (dist/docs, written by the package's build.mjs): every token with
 * its Light value, its Dark value where the theme changes it, and the text-on-surface contrast pairs the package
 * guarantees. Read once at build time from node_modules; the Foundations token tables render from this data, so a
 * value is never typed by hand. No React; runs in server components and scripts only.
 *
 * Grouping: color tokens group by the second path segment (color/slate/50 → slate, color/text/primary → text); all
 * other tokens by the first (space/4 → space, typography/display/xl → typography), because their second segment is the
 * token itself. Groups keep the order of the Light file.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';

const DIR = 'node_modules/@med-o/design-tokens/dist/docs';

const Token = z.looseObject({
  /** slate/50, space/4 – the name the docs use. */
  name: z.string(),
  /** ["color", "slate", "50"] */
  path: z.array(z.string()).min(1),
  type: z.string(),
  /** --medo-color-slate-50 */
  cssVar: z.string(),
  value: z.union([z.string(), z.number()]),
  /** The token this one points to (info/600), for semantic tokens. */
  ref: z.string().optional(),
  description: z.string().optional(),
});

const Ratios = z.looseObject({ light: z.number(), dark: z.number(), 'light-more': z.number(), 'dark-more': z.number() });

const Contrast = z.looseObject({
  /** The minimum ratio every pair meets (WCAG 2.2 AA, 4.5). */
  min: z.number(),
  groups: z.array(
    z.looseObject({
      name: z.string(),
      use: z.string(),
      pairs: z.array(z.looseObject({ surface: z.string(), text: z.string(), contrast: Ratios })),
    }),
  ),
});

type RawToken = z.infer<typeof Token>;

/** One guaranteed text-on-surface pair with its ratios in Light, Dark and both with "Increase contrast" on. */
export interface ContrastPair {
  group: string;
  surface: string;
  text: string;
  ratio: { light: number; dark: number; lightMore: number; darkMore: number };
}

export interface DocToken {
  name: string;
  path: string[];
  type: string;
  cssVar: string;
  light: string | number;
  /** Equal to `light` for the 326 tokens that do not change with the theme. */
  dark: string | number;
  ref?: string;
  /** The Dark theme's reference when it differs from `ref`. */
  darkRef?: string;
  description?: string;
  /** The pairs this token takes part in, as surface or as text. */
  contrast: ContrastPair[];
}

export interface TokenGroup {
  /** slate, text, space, typography … */
  id: string;
  tokens: DocToken[];
}

export interface TokenDocs {
  groups: TokenGroup[];
  contrast: { min: number; groups: { name: string; use: string; pairs: ContrastPair[] }[] };
}

async function readJson<T>(file: string, schema: z.ZodType<T>): Promise<T> {
  const relative = `${DIR}/${file}`;
  const result = schema.safeParse(JSON.parse(await readFile(path.join(process.cwd(), relative), 'utf8')));
  if (!result.success) {
    const problems = result.error.issues.map((issue) => `  ${issue.path.join('.') || 'file'} – ${issue.message}`);
    throw new Error(`${relative} does not match the token docs schema:\n${problems.join('\n')}`);
  }
  return result.data;
}

const groupOf = (token: RawToken) => (token.path[0] === 'color' ? token.path[1] : token.path[0]) ?? token.path[0];

async function load(): Promise<TokenDocs> {
  const [light, dark, contrast] = await Promise.all([
    readJson('tokens.light.json', z.array(Token)),
    readJson('tokens.dark.json', z.array(Token)),
    readJson('contrast.json', Contrast),
  ]);

  const byName = new Map<string, DocToken>();
  for (const token of light) {
    if (byName.has(token.name)) throw new Error(`${DIR}/tokens.light.json: token "${token.name}" appears twice`);
    byName.set(token.name, { ...token, light: token.value, dark: token.value, contrast: [] });
  }

  // Dark holds only the tokens the theme changes; each must exist in Light, the source of names and groups.
  const orphans = dark.filter((token) => !byName.has(token.name)).map((token) => token.name);
  if (orphans.length) throw new Error(`${DIR}/tokens.dark.json: no Light counterpart for ${orphans.join(', ')}`);
  for (const token of dark) {
    const doc = byName.get(token.name)!;
    doc.dark = token.value;
    doc.ref ??= token.ref;
    doc.description ??= token.description;
    if (token.ref && token.ref !== doc.ref) doc.darkRef = token.ref;
  }

  const contrastGroups = contrast.groups.map((group) => ({
    name: group.name,
    use: group.use,
    pairs: group.pairs.map((pair): ContrastPair => {
      for (const name of [pair.surface, pair.text]) {
        if (!byName.has(name)) throw new Error(`${DIR}/contrast.json: pair "${pair.text}" on "${pair.surface}" names an unknown token ${name}`);
      }
      const { light, dark, 'light-more': lightMore, 'dark-more': darkMore } = pair.contrast;
      return { group: group.name, surface: pair.surface, text: pair.text, ratio: { light, dark, lightMore, darkMore } };
    }),
  }));
  for (const pair of contrastGroups.flatMap((group) => group.pairs)) {
    byName.get(pair.surface)!.contrast.push(pair);
    byName.get(pair.text)!.contrast.push(pair);
  }

  const groups = new Map<string, TokenGroup>();
  for (const token of light) {
    const id = groupOf(token);
    const group = groups.get(id) ?? { id, tokens: [] };
    group.tokens.push(byName.get(token.name)!);
    groups.set(id, group);
  }

  return { groups: [...groups.values()], contrast: { min: contrast.min, groups: contrastGroups } };
}

let cache: Promise<TokenDocs> | undefined;

/** Groups and contrast pairs. Read once per process. */
export function getTokenDocs(): Promise<TokenDocs> {
  cache ??= load();
  return cache;
}

/** The token groups in the order of the Light file, each with its tokens. */
export async function getTokenGroups(): Promise<TokenGroup[]> {
  return (await getTokenDocs()).groups;
}

/** One group by id (slate, text, space …), or a build error naming it and the groups that exist. */
export async function getTokenGroup(id: string): Promise<TokenGroup> {
  const groups = await getTokenGroups();
  const group = groups.find((g) => g.id === id);
  if (!group) throw new Error(`Token group "${id}" is not in ${DIR}/tokens.light.json (groups: ${groups.map((g) => g.id).join(', ')})`);
  return group;
}
