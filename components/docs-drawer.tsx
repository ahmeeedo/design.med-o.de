/**
 * Docs menu for tablets (768–1023 px, Figma 11:1916): a "Menu" button above the page opens the docs tree and the
 * theme select in a Drawer from the left. Choosing a page closes it.
 */
'use client';

import { DialogTrigger } from 'react-aria-components';
import { Button, Drawer, Stack } from '@med-o/ui';
import { PanelLeft } from 'lucide-react';
import { DocsNav } from './docs-nav';
import type { DocsArea } from './site-data';
import { ThemeSelect } from './theme-select';

export function DocsDrawer({ areas }: { areas: DocsArea[] }) {
  return (
    <DialogTrigger>
      <Button variant="secondary" size="sm" startIcon={<PanelLeft />}>
        Menu
      </Button>
      <Drawer title="Docs" side="left" size="sm">
        {(close) => (
          <Stack gap="group">
            <DocsNav areas={areas} onNavigate={close} />
            <ThemeSelect />
          </Stack>
        )}
      </Drawer>
    </DialogTrigger>
  );
}
