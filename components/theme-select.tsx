/**
 * Theme select (System, Light, Dark) at the bottom of the docs sidebar and in the mobile menu, with the label beside
 * the field as in Figma Site/Sidebar. Every instance shows the same choice; see theme.ts for how it is stored.
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

export function ThemeSelect() {
  const theme = useTheme();

  return (
    <Select
      label="Theme"
      labelPosition="start"
      size="sm"
      leadingIcon={<SunMoon />}
      value={theme}
      onChange={(key: Key | null) => key && setTheme(key as Theme)}
    >
      {OPTIONS.map((o) => (
        <Option key={o.id} id={o.id} icon={o.icon}>
          {o.label}
        </Option>
      ))}
    </Select>
  );
}
