/**
 * The docs tree (Figma Site/Sidebar 123:4710): a filter field above one NavGroup per docs area, the current page
 * marked, a status badge on pages that are not stable. Used in the docs sidebar, its tablet drawer and the mobile
 * menu. The tree comes from the content files (getDocsTree); `onNavigate` lets an overlay close when a page is
 * chosen. A tab page (/docs/components/button/styling) marks its page item, so the match is "at or below" the href.
 */
'use client';

import { usePathname } from 'next/navigation';
import { Badge, NavGroup, NavItem, NavList, type BadgeTone } from '@med-o/ui';
import type { Status } from './docs-content';
import { isWithin, type DocsArea } from './site-data';

/** Pages that are not stable carry their status; stable pages carry nothing, as in the Figma sidebar. */
const BADGES: Partial<Record<Status, { label: string; tone: BadgeTone }>> = {
  experimental: { label: 'Experimental', tone: 'warning' },
  beta: { label: 'Beta', tone: 'info' },
  deprecated: { label: 'Deprecated', tone: 'danger' },
};

export function DocsNav({ areas, onNavigate }: { areas: DocsArea[]; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <NavList variant="sidebar" aria-label="Docs" filter>
      {areas.map((area) => (
        <NavGroup key={area.label} label={area.label}>
          {area.pages.map((page) => {
            const badge = page.status && BADGES[page.status];
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
