/**
 * Site/Release (Figma 145:5698): one framed box per version – the version, its date and the packages it changed,
 * then the groups New · Improved · Fixed with each change's summary and, on the right, "Breaking" and the package.
 * A composition of library parts, not a design system component; its props are data only. Updates lays releases out
 * differently (69:1061) and shares the groups and the summary text from here. A long version shows 3 changes per group and "Show all N changes"; the rest is in the HTML but
 * hidden, so it is indexed for search. With `query`, the matching words are bold in the brand color (145:6568).
 * Client component: the button toggles the hidden changes.
 */
'use client';

import { useState } from 'react';
import { Badge, Button, Highlight, type BadgeTone } from '@med-o/ui';
import { ChevronDown } from 'lucide-react';
import type { Category, PackageName, Version, VersionEntry } from './changelog';
import styles from './release.module.css';

export const GROUPS: { category: Category; label: string; tone: BadgeTone }[] = [
  { category: 'new', label: 'New', tone: 'brand' },
  { category: 'improved', label: 'Improved', tone: 'info' },
  { category: 'fixed', label: 'Fixed', tone: 'neutral' },
];

const PACKAGE_LABEL: Record<PackageName, string> = { '@med-o/ui': 'UI', '@med-o/design-tokens': 'Tokens' };
const PACKAGE_ORDER: PackageName[] = ['@med-o/ui', '@med-o/design-tokens'];

const DATE = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });

/** A summary as the designs show it: plain text. Changesets mark code with backticks, the only inline Markdown used. */
export const plainSummary = (summary: string) => summary.replace(/`([^`]*)`/g, '$1');

/** Changes shown per group before "Show all N changes", as in Figma (0.7.0). */
export const RELEASE_PREVIEW = 3;

export interface ReleaseProps {
  version: Version;
  /** The id of the version heading, for "On this page" and links. */
  id?: string;
  /** Heading level of the version: 2 on the Changelog, 3 inside another section. */
  headingLevel?: 2 | 3;
  /** The search term: its matches are bold. */
  query?: string;
  /** Changes per group before the rest is folded away; `false` shows all, as while a filter is set. */
  preview?: number | false;
}

export function Release({ version, id, headingLevel = 2, query, preview = RELEASE_PREVIEW }: ReleaseProps) {
  const [expanded, setExpanded] = useState(false);
  const Heading = `h${headingLevel}` as const;
  const packages = PACKAGE_ORDER.filter((pkg) => version.entries.some((entry) => entry.package === pkg));
  const groups = GROUPS.map((group) => ({ ...group, entries: version.entries.filter((e) => e.category === group.category) })).filter(
    (group) => group.entries.length > 0,
  );
  const folded = preview === false ? 0 : groups.reduce((sum, group) => sum + Math.max(0, group.entries.length - preview), 0);

  return (
    <section className={styles.release} aria-labelledby={id}>
      <div className={styles.header}>
        <Heading id={id} className="medo-text-heading-sm">
          {version.version}
        </Heading>
        {version.date && (
          <p className="medo-text-body-sm medo-text-secondary">
            <time dateTime={version.date}>{DATE.format(new Date(`${version.date}T00:00:00Z`))}</time>
          </p>
        )}
        <p className={`medo-text-body-sm medo-text-secondary ${styles.packages}`}>{packages.join(' · ')}</p>
      </div>
      {groups.map((group) => (
        <div key={group.category} className={styles.group}>
          <div className={styles.type}>
            <Badge size="sm" tone={group.tone}>
              {group.label}
            </Badge>
          </div>
          <ul className={styles.changes}>
            {group.entries.map((entry, index) => (
              <Change
                key={entry.key}
                entry={entry}
                query={query}
                hidden={preview !== false && !expanded && index >= preview}
              />
            ))}
          </ul>
        </div>
      ))}
      {folded > 0 && (
        <div className={styles.footer}>
          <Button
            variant="text"
            size="sm"
            endIcon={<ChevronDown className={expanded ? styles.flipped : undefined} />}
            aria-expanded={expanded}
            onPress={() => setExpanded((open) => !open)}
          >
            {expanded ? 'Show fewer changes' : `Show all ${version.entries.length} changes`}
          </Button>
        </div>
      )}
    </section>
  );
}

function Change({ entry, query, hidden }: { entry: VersionEntry; query?: string; hidden: boolean }) {
  return (
    <li className={styles.change} hidden={hidden}>
      <p className={`medo-text-body-md ${styles.summary}`}>
        <Highlight text={plainSummary(entry.summary)} query={query} all as="span" className={styles.match} />
      </p>
      <span className={styles.meta}>
        {entry.breaking && (
          <Badge size="sm" tone="danger">
            Breaking
          </Badge>
        )}
        <Badge size="sm">{PACKAGE_LABEL[entry.package]}</Badge>
      </span>
    </li>
  );
}
