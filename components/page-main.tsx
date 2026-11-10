/**
 * The <main> landmark of every page: id "main" for the skip link, focusable from script so the skip link moves
 * focus in every browser.
 */
import styles from './page-main.module.css';

export function PageMain({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" tabIndex={-1} className={styles.main}>
      {children}
    </main>
  );
}
