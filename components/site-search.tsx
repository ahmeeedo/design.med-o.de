/**
 * Site search: the header's search button and Cmd/Ctrl + K open QuickSearch; results come from the Pagefind index
 * that `npm run build` writes to out/pagefind. Pagefind loads on the first open, never with the page, and the
 * bundler leaves its import alone – it is a file of the export, not a module of the app.
 * With an empty query the dialog lists the docs pages and the site pages, so it is never empty. Results show the
 * page title only: an Option description fails axe label-content-name-mismatch. `next dev` has no index: the dialog
 * says so and keeps the suggestions.
 */
'use client';

import { useRef, useState, useSyncExternalStore, type Key } from 'react';
import { useRouter } from 'next/navigation';
import { IconButton, ListBoxSection, Option, QuickSearch } from '@med-o/ui';
import { Search } from 'lucide-react';
import type { DocsArea } from './site-data';

/** The part of the Pagefind browser API this file uses (pagefind.app/docs/api). */
interface PagefindResult {
  url: string;
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

const noop = () => () => {};
/** The shortcut as aria-keyshortcuts: ⌘ K on Apple devices, Ctrl K elsewhere. The static HTML says Ctrl. */
const useShortcut = () =>
  useSyncExternalStore(
    noop,
    () => (/Mac|iPhone|iPad/.test(navigator.userAgent) ? 'Meta+K' : 'Control+K'),
    () => 'Control+K',
  );

export function SiteSearch({ docsTree }: { docsTree: DocsArea[] }) {
  const router = useRouter();
  const shortcut = useShortcut();
  const [open, setOpen] = useState(false);
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

  // Every open starts empty with the suggestions; Esc in a filled field clears it first, then closes.
  const onOpenChange = (value: boolean) => {
    setOpen(value);
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
      data.map((d) => {
        const title = d.meta.title ?? toHref(d.url);
        return { url: toHref(d.url), title, area: d.meta.area ?? 'Pages' };
      }),
    );
    setPending(false);
  };

  const message = (term: string) => {
    if (status === 'unavailable') return 'Search works in the built site. Run npm run build and open the exported site.';
    if (status !== 'ready' || pending) return 'Loading results…';
    return `No results for “${term}”`;
  };

  // Results grouped by area, in the order Pagefind ranks their best hit.
  const groups = hits.reduce<{ area: string; hits: Hit[] }[]>((list, hit) => {
    const group = list.find((g) => g.area === hit.area);
    if (group) group.hits.push(hit);
    else list.push({ area: hit.area, hits: [hit] });
    return list;
  }, []);

  return (
    <>
      <IconButton
        variant="ghost"
        size="md"
        icon={<Search />}
        aria-label="Search"
        shortcut={shortcut}
        onPress={() => onOpenChange(true)}
      />
      <QuickSearch
        isOpen={open}
        onOpenChange={onOpenChange}
        inputValue={query}
        onInputChange={onInputChange}
        clientFilter={false}
        onAction={(key: Key) => router.push(String(key))}
        aria-label="Search the docs"
        placeholder="Search the docs"
        noResultsLabel={message}
      >
        {query.trim()
          ? groups.map((group) => (
              <ListBoxSection key={`results-${group.area}`} id={`results-${group.area}`} title={group.area}>
                {group.hits.map((hit) => (
                  <Option key={hit.url} id={hit.url}>
                    {hit.title}
                  </Option>
                ))}
              </ListBoxSection>
            ))
          : [
              ...docsTree.map((area) => (
                <ListBoxSection key={`docs-${area.label}`} id={`docs-${area.label}`} title={area.label}>
                  {area.pages.map((page) => (
                    <Option key={page.href} id={page.href}>
                      {page.label}
                    </Option>
                  ))}
                </ListBoxSection>
              )),
              <ListBoxSection key="pages" id="pages" title="Pages">
                {SITE_PAGES.map((page) => (
                  <Option key={page.href} id={page.href}>
                    {page.label}
                  </Option>
                ))}
              </ListBoxSection>,
            ]}
      </QuickSearch>
    </>
  );
}
