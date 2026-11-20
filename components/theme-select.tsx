/**
 * Theme select (System, Light, Dark). In the header on every page it stands alone with the icon as its visible
 * cue and "Theme" as its name; in the mobile menu it shows the label beside the field. Every instance shows the same
 * choice; see theme.ts for how it is stored.
 */
'use client';

import type { Key } from 'react-aria-components';
import { Option, Select } from '@med-o/ui';
import { Moon, Sun, SunMoon } from 'lucide-react';
import { setTheme, useTheme, type Theme } from './theme';

const OPTIONS: { id: Theme; label: string; icon: React.ReactNode }[] = [
  { id: 'system', label: 'System', icon: <SunMoon /> },
  { id: 'light', label: 'Light', icon: <Sun /> },
  { id: 'dark', label: 'Dark', icon: <Moon /> },
];

export function ThemeSelect({ size = 'md', label = 'hidden', className }: { size?: 'md' | 'lg'; label?: 'hidden' | 'start'; className?: string }) {
  const theme = useTheme();

  return (
    <Select
      {...(label === 'start' ? { label: 'Theme', labelPosition: 'start' as const } : { 'aria-label': 'Theme' })}
      size={size}
      leadingIcon={<SunMoon />}
      value={theme}
      onChange={(key: Key | null) => key && setTheme(key as Theme)}
      className={className}
    >
      {OPTIONS.map((o) => (
        <Option key={o.id} id={o.id} icon={o.icon}>
          {o.label}
        </Option>
      ))}
    </Select>
  );
}
