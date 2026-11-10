/**
 * Docs layout: the docs sidebar next to the page. The sidebar is a column from 1024 px, a Drawer behind the Menu
 * button from 768 px and part of the mobile menu below – see docs.module.css.
 */
import { Container } from '@med-o/ui';
import { DocsDrawer } from '../../components/docs-drawer';
import { DocsNav } from '../../components/docs-nav';
import { PageMain } from '../../components/page-main';
import { ThemeSelect } from '../../components/theme-select';
import styles from './docs.module.css';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.docs}>
      <div className={styles.sidebar}>
        <div className={styles.tree}>
          <DocsNav />
        </div>
        <div className={styles.settings}>
          <ThemeSelect />
        </div>
      </div>
      <div>
        <Container size="prose" className={styles.drawer}>
          <DocsDrawer />
        </Container>
        <PageMain>{children}</PageMain>
      </div>
    </div>
  );
}
