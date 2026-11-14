/**
 * The external resources (Storybook, Figma library, GitHub, npm) in their two forms: the header popover behind the
 * 9-dot button (Figma 11:1443) and a section of the mobile menu (Figma 79:4133). Every link opens a new tab; the
 * popover shows the external icon after the label, the sheet before it, as the designs do.
 */
'use client';

import { IconButton, NavItem, NavList, NavSection, Popover, PopoverTrigger, type NavVariant } from '@med-o/ui';
import { ExternalLink, Grip } from 'lucide-react';
import { RESOURCES } from './site-data';

export function ResourcesMenu() {
  return (
    <PopoverTrigger>
      <IconButton variant="ghost" size="md" icon={<Grip />} aria-label="Resources" />
      <Popover aria-label="Resources" size="fit" placement="bottom end">
        <ResourcesNav variant="sidebar" />
      </Popover>
    </PopoverTrigger>
  );
}

export function ResourcesNav({ variant }: { variant: Extract<NavVariant, 'sidebar' | 'sheet'> }) {
  const icon = <ExternalLink />;
  return (
    <NavList variant={variant} aria-label="Resources">
      <NavSection title="Resources">
        {RESOURCES.map((r) => (
          <NavItem key={r.href} href={r.href} target="_blank" icon={variant === 'sheet' ? icon : undefined} endIcon={variant === 'sidebar' ? icon : undefined}>
            {r.label}
          </NavItem>
        ))}
      </NavSection>
    </NavList>
  );
}
