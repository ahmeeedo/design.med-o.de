/**
 * The external resources (Storybook, Figma library, GitHub, npm) in their two forms: the header popover behind the
 * 9-dot button (Figma Site/Nav popover) and a nav section for the mobile menu. Every link opens a new tab.
 */
'use client';

import { IconButton, Link, NavItem, NavSection, Popover, PopoverTrigger, Stack } from '@med-o/ui';
import { ExternalLink, Grip } from 'lucide-react';
import { RESOURCES } from './site-data';
import text from './text.module.css';

export function ResourcesMenu() {
  return (
    <PopoverTrigger>
      <IconButton variant="ghost" size="md" icon={<Grip />} aria-label="Resources" />
      <Popover aria-label="Resources" size="sm" placement="bottom end">
        <Stack gap="inline">
          <span className={`medo-text-label-sm-strong ${text.secondary}`}>Resources</span>
          <Stack gap="content" align="start">
            {RESOURCES.map((r) => (
              <Link key={r.href} href={r.href} variant="standalone" external target="_blank">
                {r.label}
              </Link>
            ))}
          </Stack>
        </Stack>
      </Popover>
    </PopoverTrigger>
  );
}

export function ResourcesSection() {
  return (
    <NavSection title="Resources">
      {RESOURCES.map((r) => (
        <NavItem
          key={r.href}
          href={r.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${r.label} (opens in a new tab)`}
          icon={<ExternalLink />}
        >
          {r.label}
        </NavItem>
      ))}
    </NavSection>
  );
}
