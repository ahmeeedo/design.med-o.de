/**
 * Docs layout: the docs sidebar next to the page. The sidebar is a column from 1024 px, a Drawer behind the Menu
 * button from 768 px and part of the mobile menu below – see docs.module.css. The page sits left in its column, as
 * in Figma 106:3625. The tree comes from the content files.
 */
import { Stack } from '@med-o/ui';
import { getDocsTree } from '../../components/docs-content';
import { DocsDrawer } from '../../components/docs-drawer';
import { DocsNav } from '../../components/docs-nav';
import { PageMain } from '../../components/page-main';
import { ThemeSelect } from '../../components/theme-select';
import styles from './docs.module.css';

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  const tree = await getDocsTree();

  return (
    <div className={styles.docs}>
      <aside className={styles.sidebar} aria-label="Docs sidebar">
        <div className={styles.tree}>
          <DocsNav areas={tree} />
        </div>
        <div className={styles.settings}>
          <ThemeSelect />
        </div>
      </aside>
      <PageMain>
        <Stack gap="group" className={styles.page}>
          <div className={styles.drawer}>
            <DocsDrawer areas={tree} />
          </div>
          {children}
        </Stack>
      </PageMain>
    </div>
  );
}
