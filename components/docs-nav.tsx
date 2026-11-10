/**
 * The docs tree: one NavGroup per docs area, the current page marked. Used in the docs sidebar, its tablet drawer
 * and the mobile menu. The tree comes from the content files (getDocsTree); `onNavigate` lets an overlay close when
 * a page is chosen.
 */
'use client';

import { usePathname } from 'next/navigation';
import { NavGroup, NavItem, NavList } from '@med-o/ui';
import type { DocsArea } from './site-data';

export function DocsNav({ areas, onNavigate }: { areas: DocsArea[]; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <NavList variant="sidebar" aria-label="Docs">
      {areas.map((area) => (
        <NavGroup key={area.label} label={area.label}>
          {area.pages.map((page) => (
            <NavItem key={page.href} href={page.href} isCurrent={pathname === page.href} onPress={onNavigate}>
              {page.label}
            </NavItem>
          ))}
        </NavGroup>
      ))}
    </NavList>
  );
}
