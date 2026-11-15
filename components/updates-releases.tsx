/**
 * The latest releases on Updates (Figma 69:1061, mobile 79:2856): the type chips All · Breaking · New · Improved · Fixed,
 * then two versions, each a row of version and date beside its changes – "Before you update" first, then the groups
 * as a badge and a list. A chip shows the two latest versions that have such changes. The choice is local: the page
 * shows only the latest releases, so a filtered view has nothing to share; the full history is the Changelog.
 * The static HTML shows "All".
 */
'use client';

import { useState } from 'react';
import type { Key, Selection } from 'react-aria-components';
import { Badge, List, ListItem, Stack, Tag, TagGroup } from '@med-o/ui';
import { BeforeYouUpdate } from './before-you-update';
import type { Version, VersionEntry } from './changelog';
import { GROUPS, plainSummary } from './release';
import styles from './updates-releases.module.css';

const TYPES = [
  { id: 'all', label: 'All' },
  { id: 'breaking', label: 'Breaking' },
  { id: 'new', label: 'New' },
  { id: 'improved', label: 'Improved' },
  { id: 'fixed', label: 'Fixed' },
] as const;
type TypeFilter = (typeof TYPES)[number]['id'];

/** Versions shown, as in the design. */
const LATEST = 2;

const DATE = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });

const matches = (type: TypeFilter) => (entry: VersionEntry) =>
  type === 'all' || (type === 'breaking' ? Boolean(entry.breaking) : entry.category === type);

/** The latest versions with changes of the type, each with only those changes. */
function latestVersions(versions: Version[], type: TypeFilter): Version[] {
  return versions
    .map((version) => ({ ...version, entries: version.entries.filter(matches(type)) }))
    .filter((version) => version.entries.length > 0)
    .slice(0, LATEST);
}

export function UpdatesReleases({ versions }: { versions: Version[] }) {
  const [type, setType] = useState<TypeFilter>('all');
  const shown = latestVersions(versions, type);

  return (
    <Stack gap="group">
      <div data-pagefind-ignore="all">
        <TagGroup
          aria-label="Type"
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={new Set<Key>([type])}
          onSelectionChange={(keys: Selection) => {
            const [next] = keys === 'all' ? [] : [...keys];
            if (next) setType(next as TypeFilter);
          }}
        >
          {TYPES.map((t) => (
            <Tag key={t.id} id={t.id}>
              {t.label}
            </Tag>
          ))}
        </TagGroup>
      </div>
      {shown.map((version) => (
        <section key={version.version} className={styles.release} aria-labelledby={`release-${version.id}`}>
          <Stack gap="inline">
            <h2 id={`release-${version.id}`} className="medo-text-heading-md">
              {version.version}
            </h2>
            {version.date && (
              <p className="medo-text-caption medo-text-secondary">
                <time dateTime={version.date}>{DATE.format(new Date(`${version.date}T00:00:00Z`))}</time>
              </p>
            )}
          </Stack>
          <Stack gap="content">
            <BeforeYouUpdate entries={version.entries} />
            {GROUPS.map((group) => {
              const entries = version.entries.filter((entry) => entry.category === group.category);
              if (entries.length === 0) return null;
              return (
                <Stack key={group.category} gap="inline" align="start">
                  <Badge tone={group.tone}>{group.label}</Badge>
                  <List type="bullet" size="md" className={styles.list}>
                    {entries.map((entry) => (
                      <ListItem key={entry.key}>{plainSummary(entry.summary)}</ListItem>
                    ))}
                  </List>
                </Stack>
              );
            })}
          </Stack>
        </section>
      ))}
    </Stack>
  );
}
