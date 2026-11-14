/**
 * The docs tree (Figma Site/Sidebar 123:4710): a filter field above one NavGroup per docs area, the current page
 * marked, a status badge on pages that are not stable. Used in the docs sidebar, its tablet drawer and the mobile
 * menu. The tree comes from the content files (getDocsTree); `onNavigate` lets an overlay close when a page is
 * chosen. A tab page (/docs/components/button/styling) marks its page item, so the match is "at or below" the href.
 */
'use client';

import { usePathname } from 'next/navigation';
import { Badge, NavGroup, NavItem, NavList } from '@med-o/ui';
import { isWithin, type DocsArea } from './site-data';
import { STATUS } from './status';

export function DocsNav({ areas, onNavigate }: { areas: DocsArea[]; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <NavList variant="sidebar" aria-label="Docs" filter>
      {areas.map((area) => (
        <NavGroup key={area.label} label={area.label}>
          {area.pages.map((page) => {
            // Stable pages carry nothing, as in the Figma sidebar.
            const badge = page.status && page.status !== 'stable' ? STATUS[page.status] : undefined;
            return (
              <NavItem
                key={page.href}
                href={page.href}
                isCurrent={isWithin(pathname, page.href)}
                badge={badge && <Badge tone={badge.tone} size="sm">{badge.label}</Badge>}
                onPress={onNavigate}
              >
                {page.label}
              </NavItem>
            );
          })}
        </NavGroup>
      ))}
    </NavList>
  );
}
