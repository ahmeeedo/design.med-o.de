/**
 * Theme select (System, Light, Dark) at the bottom of the docs sidebar and in the mobile menu.
 * Every instance shows the same choice; see theme.ts for how it is stored and applied.
 */
'use client';

import type { Key } from 'react-aria-components';
import { Option, Select } from '@med-o/ui';
import { SunMoon } from 'lucide-react';
import { setTheme, useTheme, type Theme } from './theme';

const OPTIONS: { id: Theme; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

export function ThemeSelect({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const theme = useTheme();

  return (
    <Select
      label="Theme"
      size={size}
      leadingIcon={<SunMoon />}
      value={theme}
      onChange={(key: Key | null) => key && setTheme(key as Theme)}
    >
      {OPTIONS.map((o) => (
        <Option key={o.id} id={o.id}>
          {o.label}
        </Option>
      ))}
    </Select>
  );
}
