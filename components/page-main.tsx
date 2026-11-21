/**
 * The <main> landmark of every page, followed by the site footer: id "main" for the skip link, focusable from script
 * so the skip link moves focus in every browser. The footer comes with it, so a page with a sidebar (docs) keeps the
 * footer in its page column and the sidebar stays in place to the end of the page.
 */
import { SiteFooter } from './site-footer';
import styles from './page-main.module.css';

export function PageMain({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <>
      <main id="main" tabIndex={-1} className={className ? `${styles.main} ${className}` : styles.main}>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
