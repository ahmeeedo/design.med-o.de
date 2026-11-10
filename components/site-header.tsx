/**
 * Site header (Figma Site/Header): logo, the page links Showcase · Docs · Updates in the middle, and the actions
 * search, Give feedback and resources. Below 768 px: logo, search and the menu button.
 * SiteHeader from @med-o/ui takes no centered links and no search or popover slot yet, so this builds the same
 * <header> from its classes. Sticky; the divider appears once the page scrolls, as in SiteHeader.
 */
'use client';

import { useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { NavItem, NavList } from '@med-o/ui';
import { FeedbackLink } from './feedback-link';
import { MobileMenu } from './mobile-menu';
import { ResourcesMenu } from './resources';
import { PAGES, isWithin, type DocsArea } from './site-data';
import { SiteLogo } from './site-logo';
import { SiteSearch } from './site-search';
import styles from './site-header.module.css';

function subscribeScroll(onChange: () => void) {
  window.addEventListener('scroll', onChange, { passive: true });
  return () => window.removeEventListener('scroll', onChange);
}

/** True once the page is scrolled; false in the static HTML. */
const useScrolled = () => useSyncExternalStore(subscribeScroll, () => window.scrollY > 0, () => false);

export function SiteHeader({ docsTree }: { docsTree: DocsArea[] }) {
  const pathname = usePathname();
  const scrolled = useScrolled();

  return (
    <header className={`medo-site-header ${styles.header}`} data-scrolled={scrolled || undefined}>
      <div className="medo-site-header__logo">
        <SiteLogo />
      </div>
      <NavList variant="header" aria-label="Main" className={`medo-site-header__nav ${styles.pages} ${styles.wide}`}>
        {PAGES.map((page) => (
          <NavItem key={page.href} href={page.href} isCurrent={isWithin(pathname, page.match)}>
            {page.label}
          </NavItem>
        ))}
      </NavList>
      <div className="medo-site-header__actions">
        <SiteSearch docsTree={docsTree} />
        <FeedbackLink className={styles.wide} />
        <div className={styles.wide}>
          <ResourcesMenu />
        </div>
        <div className={styles.narrow}>
          <MobileMenu docsTree={docsTree} />
        </div>
      </div>
    </header>
  );
}
