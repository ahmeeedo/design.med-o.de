/**
 * The Changelog's search and filters (Figma 145:5698, 145:6568, 145:6977): a search over summaries, details and
 * breaking notes – component, prop and token names included –, the package, and the type (All, Breaking, New,
 * Improved, Fixed). The state lives in the URL (?q=dialog&package=ui&type=fixed), so a filtered view can be shared
 * and survives a reload; it is written with router.replace and no scroll.
 * The static HTML lists every version (ChangelogView without a URL, the Suspense fallback of release-list.tsx), so
 * the page reads without JavaScript; ChangelogFromUrl takes over in the browser. A filter shows every matching change
 * of a version; without one, long versions fold after 3 changes per group. The count is a polite status message.
 */
'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Key, Selection } from 'react-aria-components';
import { Button, EmptyState, Option, SearchField, Select, Stack, Tag, TagGroup } from '@med-o/ui';
import type { PackageName, Version, VersionEntry } from './changelog';
import { Release } from './release';
import styles from './changelog-filters.module.css';

const TYPES = [
  { id: 'all', label: 'All' },
  { id: 'breaking', label: 'Breaking' },
  { id: 'new', label: 'New' },
  { id: 'improved', label: 'Improved' },
  { id: 'fixed', label: 'Fixed' },
] as const;
type TypeFilter = (typeof TYPES)[number]['id'];

const PACKAGES = [
  { id: 'all', label: 'All packages' },
  { id: 'ui', label: '@med-o/ui', name: '@med-o/ui' },
  { id: 'tokens', label: '@med-o/design-tokens', name: '@med-o/design-tokens' },
] as const;
type PackageFilter = (typeof PACKAGES)[number]['id'];

export interface ChangelogFilter {
  q: string;
  type: TypeFilter;
  package: PackageFilter;
}

const NONE: ChangelogFilter = { q: '', type: 'all', package: 'all' };

/** Case and accents do not count, as in the library's Highlight: "über" finds "Über". */
const plain = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase();

/** Everything an entry says, for the text search: summary, details and its breaking note, without code backticks. */
const searchText = (entry: VersionEntry) =>
  plain(
    [
      entry.summary,
      ...entry.body.flatMap((block) => (block.type === 'list' ? block.items : [block.text])),
      entry.breaking?.text ?? '',
      entry.breaking?.update ?? '',
    ]
      .join(' ')
      .replaceAll('`', ''),
  );

function matches(entry: VersionEntry, filter: ChangelogFilter, term: string) {
  if (filter.type === 'breaking' ? !entry.breaking : filter.type !== 'all' && entry.category !== filter.type) return false;
  const pkg = PACKAGES.find((p) => p.id === filter.package);
  if (pkg && 'name' in pkg && entry.package !== (pkg.name as PackageName)) return false;
  return !term || searchText(entry).includes(term);
}

const isActive = (filter: ChangelogFilter) => filter.q.trim() !== '' || filter.type !== 'all' || filter.package !== 'all';

/** The filter from the URL; unknown values fall back to "all". */
function fromParams(params: URLSearchParams): ChangelogFilter {
  const type = TYPES.find((t) => t.id === params.get('type'))?.id ?? 'all';
  const pkg = PACKAGES.find((p) => p.id === params.get('package'))?.id ?? 'all';
  return { q: params.get('q') ?? '', type, package: pkg };
}

function toQuery(filter: ChangelogFilter) {
  const params = new URLSearchParams();
  if (filter.q.trim()) params.set('q', filter.q.trim());
  if (filter.package !== 'all') params.set('package', filter.package);
  if (filter.type !== 'all') params.set('type', filter.type);
  const query = params.toString();
  return query ? `?${query}` : '';
}

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

/** The filters bound to the URL: the version that runs in the browser. */
export function ChangelogFromUrl({ versions }: { versions: Version[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const fromUrl = fromParams(new URLSearchParams(params.toString()));
  // The search keeps its own state while typing; the URL follows each change.
  const [q, setQ] = useState(fromUrl.q);
  const filter = { ...fromUrl, q };

  const change = (next: ChangelogFilter) => {
    setQ(next.q);
    router.replace(`${pathname}${toQuery(next)}`, { scroll: false });
  };

  return <ChangelogView versions={versions} filter={filter} onChange={change} />;
}

/** Search, filters, the count and the matching versions. Without `onChange` it shows every version (static HTML). */
export function ChangelogView({
  versions,
  filter = NONE,
  onChange = () => {},
}: {
  versions: Version[];
  filter?: ChangelogFilter;
  onChange?: (filter: ChangelogFilter) => void;
}) {
  const term = plain(filter.q.trim());
  const active = isActive(filter);
  const shown = versions
    .map((version) => ({ ...version, entries: version.entries.filter((entry) => matches(entry, filter, term)) }))
    .filter((version) => version.entries.length > 0);
  const changes = shown.reduce((sum, version) => sum + version.entries.length, 0);
  const count = changes === 0 ? 'No changes' : `${plural(changes, 'change', 'changes')} in ${plural(shown.length, 'release', 'releases')}`;
  const set = (patch: Partial<ChangelogFilter>) => onChange({ ...filter, ...patch });

  return (
    <Stack gap="items">
      <Stack gap="content" data-pagefind-ignore="all">
        <div className={styles.search}>
          <SearchField
            aria-label="Search changes"
            placeholder="Search changes – a component, prop or token"
            value={filter.q}
            onChange={(q) => set({ q })}
            className={styles.field}
          />
          <Select
            aria-label="Package"
            value={filter.package}
            onChange={(key: Key | null) => key && set({ package: key as PackageFilter })}
            className={styles.package}
          >
            {PACKAGES.map((p) => (
              <Option key={p.id} id={p.id}>
                {p.label}
              </Option>
            ))}
          </Select>
        </div>
        <Stack direction="horizontal" justify="between" align="center" gap="content" wrap>
          <TagGroup
            aria-label="Type"
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={new Set([filter.type])}
            onSelectionChange={(keys: Selection) => {
              const [type] = keys === 'all' ? [] : [...keys];
              if (type) set({ type: type as TypeFilter });
            }}
          >
            {TYPES.map((t) => (
              <Tag key={t.id} id={t.id}>
                {t.label}
              </Tag>
            ))}
          </TagGroup>
          <Stack direction="horizontal" gap="content" align="center">
            <p role="status" className="medo-text-body-sm medo-text-secondary">
              {count}
            </p>
            {active && changes > 0 && (
              <Button variant="text" size="sm" onPress={() => onChange(NONE)}>
                Clear filters
              </Button>
            )}
          </Stack>
        </Stack>
      </Stack>
      {shown.length > 0 ? (
        <Stack gap="items">
          {shown.map((version) => (
            <Release
              key={version.version}
              version={version}
              id={version.id}
              query={filter.q.trim() || undefined}
              preview={active ? false : undefined}
            />
          ))}
        </Stack>
      ) : (
        <div className={styles.empty}>
          <EmptyState
            type="no-results"
            size="section"
            headingLevel={2}
            title={filter.q.trim() ? `No changes match “${filter.q.trim()}”` : 'No changes match these filters'}
            description={filter.q.trim() ? 'Try another word or clear the search.' : 'Choose another type or package.'}
            action={filter.q.trim() ? { label: 'Clear search', onPress: () => set({ q: '' }) } : { label: 'Clear filters', onPress: () => onChange(NONE) }}
          />
        </div>
      )}
    </Stack>
  );
}
