/**
 * Site search: the QuickSearch dialog behind the header's triggers and Cmd/Ctrl + K; results come from the Pagefind
 * index that `npm run build` writes to out/pagefind. Pagefind loads on the first open, never with the page, and the
 * bundler leaves its import alone – it is a file of the export, not a module of the app.
 * With an empty query the dialog lists the docs pages and the site pages, so it is never empty. A result shows the
 * page title and the Pagefind excerpt as its description. `next dev` has no index: the dialog says so and keeps the
 * suggestions. Suggestions and results use different id prefixes: React Aria keeps an item's id for its lifetime.
 */
'use client';

import { useRef, useState, type Key } from 'react';
import { useRouter } from 'next/navigation';
import { ListBoxSection, Option, QuickSearch } from '@med-o/ui';
import type { DocsArea } from './site-data';

/** The part of the Pagefind browser API this file uses (pagefind.app/docs/api). */
interface PagefindResult {
  url: string;
  excerpt: string;
  meta: { title?: string; area?: string };
}
interface Pagefind {
  init(): Promise<void>;
  debouncedSearch(
    term: string,
    options?: object,
    timeout?: number,
  ): Promise<{ results: { id: string; data(): Promise<PagefindResult> }[] } | null>;
}

type Status = 'idle' | 'loading' | 'ready' | 'unavailable';

interface Hit {
  url: string;
  title: string;
  excerpt: string;
  area: string;
}

const PAGEFIND_URL = '/pagefind/pagefind.js';
const MAX_RESULTS = 10;

const SITE_PAGES = [
  { label: 'Home', href: '/' },
  { label: 'Showcase', href: '/showcase' },
  { label: 'Updates', href: '/updates' },
];

/** Pagefind returns the file path ("/showcase.html"); the site links without the extension. */
const toHref = (url: string) => url.replace(/\.html$/, '') || '/';

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" };
/** The excerpt as plain text: Pagefind wraps matches in <mark> and escapes the rest. */
const toText = (html: string) => html.replace(/<[^>]+>/g, '').replace(/&(amp|lt|gt|quot|#39);/g, (_, e: string) => ENTITIES[e]);

/** Option ids: the href behind a prefix, so a page is one item in the suggestions and another in the results. */
const toKey = (prefix: 'page' | 'result', href: string) => `${prefix}:${href}`;
const fromKey = (key: Key) => String(key).replace(/^(page|result):/, '');

export function SiteSearch({
  isOpen,
  onOpenChange,
  docsTree,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  docsTree: DocsArea[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const pagefind = useRef<Promise<Pagefind | null> | null>(null);
  const latest = useRef('');

  // First open: fetch the Pagefind script. A failed import means there is no index (next dev).
  const load = () => {
    if (!pagefind.current) {
      setStatus('loading');
      const url = PAGEFIND_URL;
      pagefind.current = (import(/* webpackIgnore: true */ /* turbopackIgnore: true */ url) as Promise<Pagefind>)
        .then(async (api) => {
          await api.init();
          setStatus('ready');
          return api;
        })
        .catch(() => {
          setStatus('unavailable');
          return null;
        });
    }
    return pagefind.current;
  };

  // Every open starts empty with the suggestions. The dialog closes on Esc at once; the × in the field clears it.
  const open = (value: boolean) => {
    onOpenChange(value);
    if (value) void load();
    else {
      latest.current = '';
      setQuery('');
      setHits([]);
      setPending(false);
    }
  };

  const onInputChange = async (value: string) => {
    setQuery(value);
    const term = value.trim();
    latest.current = term;
    if (!term) {
      setHits([]);
      setPending(false);
      return;
    }
    setPending(true);
    const api = await load();
    if (!api) return setPending(false);
    const search = await api.debouncedSearch(term, {}, 300);
    // null: a newer keystroke replaced this search.
    if (!search || latest.current !== term) return;
    const data = await Promise.all(search.results.slice(0, MAX_RESULTS).map((r) => r.data()));
    if (latest.current !== term) return;
    setHits(
      data.map((d) => ({
        url: toHref(d.url),
        title: d.meta.title ?? toHref(d.url),
        excerpt: toText(d.excerpt),
        area: d.meta.area ?? 'Pages',
      })),
    );
    setPending(false);
  };

  const term = query.trim();
  const noResults = (value: string) =>
    status === 'unavailable' ? 'Search works in the built site. Run npm run build and open the exported site.' : `No results for “${value}”`;

  // Results grouped by area, in the order Pagefind ranks their best hit.
  const groups = hits.reduce<{ area: string; hits: Hit[] }[]>((list, hit) => {
    const group = list.find((g) => g.area === hit.area);
    if (group) group.hits.push(hit);
    else list.push({ area: hit.area, hits: [hit] });
    return list;
  }, []);

  return (
    <QuickSearch
      isOpen={isOpen}
      onOpenChange={open}
      inputValue={query}
      onInputChange={onInputChange}
      clientFilter={false}
      isLoading={Boolean(term) && status !== 'unavailable' && (pending || status !== 'ready')}
      onAction={(key: Key) => router.push(fromKey(key))}
      aria-label="Search the docs"
      placeholder="Search the docs"
      noResultsLabel={noResults}
    >
      {term
        ? groups.map((group) => (
            <ListBoxSection key={`results-${group.area}`} id={`results-${group.area}`} title={group.area}>
              {group.hits.map((hit) => (
                <Option key={toKey('result', hit.url)} id={toKey('result', hit.url)} textValue={hit.title} description={hit.excerpt}>
                  {hit.title}
                </Option>
              ))}
            </ListBoxSection>
          ))
        : [
            ...docsTree.map((area) => (
              <ListBoxSection key={`docs-${area.label}`} id={`docs-${area.label}`} title={area.label}>
                {area.pages.map((page) => (
                  <Option key={toKey('page', page.href)} id={toKey('page', page.href)}>
                    {page.label}
                  </Option>
                ))}
              </ListBoxSection>
            )),
            <ListBoxSection key="pages" id="pages" title="Pages">
              {SITE_PAGES.map((page) => (
                <Option key={toKey('page', page.href)} id={toKey('page', page.href)}>
                  {page.label}
                </Option>
              ))}
            </ListBoxSection>,
          ]}
    </QuickSearch>
  );
}
