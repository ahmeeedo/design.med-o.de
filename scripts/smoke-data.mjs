/**
 * Smoke test of the build-time data loaders (components/manifest.ts, tokens.ts, changelog.ts) without a build: the
 * Button entry, the token groups with their counts and the release list. Fails when a loader throws, so a changed
 * package shape shows up here first. Node loads the TypeScript files directly, so the script needs no dependencies.
 */
import { getComponent, getManifest, storybookUrl } from '../components/manifest.ts';
import { getTokenDocs } from '../components/tokens.ts';
import { getReleases } from '../components/changelog.ts';

const keys = (value) => Object.keys(value ?? {}).join(', ') || 'none';

const manifest = await getManifest();
const button = await getComponent('Button');
console.log(`Manifest ${manifest.package} ${manifest.version}: ${manifest.components.length} components`);
console.log(`Button: status ${button.status} · storybookId ${button.storybookId} · ${storybookUrl(button.storybookId)}`);
console.log(`  figma ${button.figma}`);
console.log(`  props ${button.props.length} · controls: ${button.playground?.controls.map((c) => c.name).join(', ') ?? 'none'}`);
console.log(`  usage: ${keys(button.usage)} · a11y: ${keys(button.a11y)} · styling: ${keys(button.styling)}`);

const { groups, contrast } = await getTokenDocs();
const total = groups.reduce((n, g) => n + g.tokens.length, 0);
console.log(`\nToken groups (${groups.length}, ${total} tokens): ${groups.map((g) => `${g.id} ${g.tokens.length}`).join(' · ')}`);
const pairs = contrast.groups.reduce((n, g) => n + g.pairs.length, 0);
console.log(`Contrast: ${pairs} pairs in ${contrast.groups.length} groups, minimum ${contrast.min}`);

const releases = await getReleases();
console.log(`\nReleases (${releases.length}):`);
for (const r of releases) {
  const count = (category) => r.entries.filter((e) => e.category === category).length;
  const breaking = r.entries.filter((e) => e.breaking).length;
  console.log(`  ${r.package} ${r.version} ${r.date ?? 'no date'} · ${r.kind} · ${count('new')} new · ${count('improved')} improved · ${count('fixed')} fixed · ${breaking} breaking`);
}
