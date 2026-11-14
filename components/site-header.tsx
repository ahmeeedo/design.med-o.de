/**
 * Site header (Figma Site/Header 10:2250): logo, the page links Showcase · Docs · Updates in the middle, and the
 * actions search, Give feedback and resources. Below 768 px the library shows logo, search and the menu button; the
 * menu is its fullscreen sheet (Figma 11:2210 on docs pages, 79:4133 elsewhere) with the page links, a Contents |
 * Resources switch with the docs tree on docs pages, and the theme select and Give feedback pinned at the bottom.
 * The search dialog is rendered once here; every trigger opens the same one.
 */
'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import type { Key } from 'react-aria-components';
import { IconButton, NavItem, QuickSearchTrigger, SiteHeader as MedoSiteHeader, Stack, ToggleButton, ToggleButtonGroup } from '@med-o/ui';
import { Grip, Search } from 'lucide-react';
import { DocsNav } from './docs-nav';
import { FeedbackLink } from './feedback-link';
import { ResourcesMenu, ResourcesNav } from './resources';
import { PAGES, isWithin, type DocsArea } from './site-data';
import { SiteLogo } from './site-logo';
import { SiteSearch } from './site-search';
import { ThemeSelect } from './theme-select';
import styles from './site-header.module.css';

export function SiteHeader({ docsTree }: { docsTree: DocsArea[] }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const openSearch = () => setSearchOpen(true);
  const searchIcon = (className?: string) => (
    <IconButton variant="ghost" size="md" icon={<Search />} aria-label="Search" shortcut="Mod+K" className={className} onPress={openSearch} />
  );

  return (
    <>
      <MedoSiteHeader
        logo={<SiteLogo />}
        align="center"
        actions={
          <>
            <QuickSearchTrigger className={styles.field} onPress={openSearch} />
            {searchIcon(styles.icon)}
            <FeedbackLink />
            <ResourcesMenu />
          </>
        }
        compactActions={searchIcon()}
        menuIcon={<Grip />}
        menuContent={isWithin(pathname, '/docs') ? <DocsMenu docsTree={docsTree} /> : <ResourcesNav variant="sheet" />}
        menuActions={
          <>
            <ThemeSelect />
            <FeedbackLink size="lg" />
          </>
        }
      >
        {PAGES.map((page) => (
          <NavItem key={page.href} href={page.href} isCurrent={isWithin(pathname, page.match)}>
            {page.label}
          </NavItem>
        ))}
      </MedoSiteHeader>
      <SiteSearch isOpen={searchOpen} onOpenChange={setSearchOpen} docsTree={docsTree} />
    </>
  );
}

/** Docs pages in the mobile menu: a switch between the docs tree and the resources (Figma 11:2210). */
function DocsMenu({ docsTree }: { docsTree: DocsArea[] }) {
  const [view, setView] = useState<Set<Key>>(new Set(['contents']));

  return (
    <Stack gap="content">
      <ToggleButtonGroup aria-label="Menu content" size="lg" fullWidth disallowEmptySelection selectedKeys={view} onSelectionChange={setView}>
        <ToggleButton id="contents">Contents</ToggleButton>
        <ToggleButton id="resources">Resources</ToggleButton>
      </ToggleButtonGroup>
      {view.has('resources') ? <ResourcesNav variant="sheet" /> : <DocsNav areas={docsTree} />}
    </Stack>
  );
}
