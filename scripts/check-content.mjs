/**
 * Unit check of the content schema (components/content-schema.ts), without a build: a page with every required
 * section passes, a missing or misplaced section fails with the file, the section and the expected order, a free
 * page needs one heading, and sections that come from data are never required in MDX. Node loads the TypeScript
 * file directly, so the script needs no dependencies and runs in well under a second.
 */
import assert from 'node:assert/strict';
import { CONTENT_SCHEMA, TABS, checkSections } from '../components/content-schema.ts';

const FILE = 'content/docs/components/button/styling.mdx';
const passes = (type, tab, headings) => assert.doesNotThrow(() => checkSections(FILE, type, tab, headings));
const fails = (type, tab, headings, ...expected) =>
  assert.throws(
    () => checkSections(FILE, type, tab, headings),
    (error) => {
      assert.ok(error.message.includes(FILE), `message names the file: ${error.message}`);
      for (const part of expected) assert.ok(error.message.includes(part), `message includes "${part}": ${error.message}`);
      return true;
    },
  );

// Every tab of the tabbed types has a rule.
for (const [type, tabs] of Object.entries(TABS)) {
  for (const tab of tabs) assert.ok(CONTENT_SCHEMA[`${type}/${tab.slug}`], `schema for ${type}/${tab.slug}`);
}
for (const type of ['guide', 'pattern', 'overview']) assert.ok(CONTENT_SCHEMA[type], `schema for ${type}`);

// Complete, with an extra section between required ones.
passes('component', 'styling', ['Color', 'Typography', 'Structure', 'Sizes']);
passes('component', 'styling', ['Color', 'Typography', 'Dark mode', 'Structure', 'Sizes']);
passes('guide', undefined, ['Goal', 'Steps', 'Examples', 'Pitfalls', 'Related']);

// Missing and misplaced sections name the section and the expected order.
fails('component', 'styling', ['Color', 'Typography', 'Sizes'], 'missing section "Structure"', 'Color · Typography · Structure · Sizes');
fails('component', 'styling', ['Color', 'Structure', 'Typography', 'Sizes'], 'out of order', '"Structure"');
fails('component', 'styling', ['Color', 'typography', 'Structure', 'Sizes'], 'missing section "Typography"');
fails('guide', undefined, [], 'missing sections "Goal", "Steps"', 'no sections');

// Headings are matched trimmed, as written.
passes('component', 'styling', [' Color ', 'Typography', 'Structure', 'Sizes']);

// Free pages need one section; data-driven tabs need none in MDX.
passes('overview', undefined, ['Who it is for']);
fails('overview', undefined, [], 'at least one');
passes('foundation', 'overview', ['Layers']);
passes('component', 'code', []);
passes('component', 'guidelines', ['Overview', 'Formatting', 'Content', 'Variants', 'Related']);
passes('foundation', 'tokens', []);

// Unknown tabs have no rule.
fails('component', 'props', ['Color'], 'no content schema');

console.log('Content schema: every rule present, missing and misplaced sections fail with the expected order.');
