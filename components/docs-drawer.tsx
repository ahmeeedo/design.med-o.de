/**
 * Docs menu for tablets (768–1023 px, Figma 11:1916): a "Menu" button above the page opens the docs tree in a Drawer
 * from the left without a visible header, so the filter starts at the top; the theme select sits at the bottom with
 * a line above it, as in the sidebar. Esc, the scrim and a swipe close it, focus returns to the button, and choosing
 * a page closes it.
 */
'use client';

import { DialogTrigger } from 'react-aria-components';
import { Button, Drawer } from '@med-o/ui';
import { PanelLeft } from 'lucide-react';
import styles from '../app/docs/docs.module.css';
import { DocsNav } from './docs-nav';
import type { DocsArea } from './site-data';
import { ThemeSelect } from './theme-select';

export function DocsDrawer({ areas }: { areas: DocsArea[] }) {
  return (
    <DialogTrigger>
      <Button variant="secondary" size="sm" startIcon={<PanelLeft />}>
        Menu
      </Button>
      <Drawer title="Docs" side="left" size="sm" hideHeader>
        {(close) => (
          <div className={styles.panel}>
            <div className={styles.tree}>
              <DocsNav areas={areas} onNavigate={close} />
            </div>
            <div className={styles.settings}>
              <ThemeSelect />
            </div>
          </div>
        )}
      </Drawer>
    </DialogTrigger>
  );
}
