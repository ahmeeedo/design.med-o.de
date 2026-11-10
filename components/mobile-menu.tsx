/**
 * Mobile menu below 768 px (Figma 11:2210 docs, 79:4133 other pages): a fullscreen sheet with the page links on top.
 * Docs pages add a Contents | Resources switch with the docs tree; other pages show the resources. Theme and
 * Give feedback are pinned at the bottom. Built from the same React Aria parts and medo-nav-fullscreen classes as
 * the SiteHeader menu, because SiteHeader cannot hold the extra sections. Esc and Close return focus to the button.
 */
'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Dialog, DialogTrigger, Modal, ModalOverlay, type Key } from 'react-aria-components';
import { IconButton, NavItem, NavList, ToggleButton, ToggleButtonGroup } from '@med-o/ui';
import { Grip, X } from 'lucide-react';
import { DocsNav } from './docs-nav';
import { FeedbackLink } from './feedback-link';
import { ResourcesSection } from './resources';
import { PAGES, isWithin } from './site-data';
import { SiteLogo } from './site-logo';
import { ThemeSelect } from './theme-select';
import styles from './mobile-menu.module.css';

export function MobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Set<Key>>(new Set(['contents']));
  const close = () => setOpen(false);
  const docs = isWithin(pathname, '/docs');
  const resources = (
    <NavList variant="sheet" aria-label="Resources">
      <ResourcesSection />
    </NavList>
  );

  return (
    <DialogTrigger isOpen={open} onOpenChange={setOpen}>
      <IconButton variant="ghost" size="md" icon={<Grip />} aria-label="Menu" tooltip={false} />
      <ModalOverlay className="medo-nav-fullscreen-overlay">
        <Modal className="medo-nav-fullscreen">
          <Dialog aria-label="Menu" className="medo-nav-fullscreen__dialog">
            <div className="medo-nav-fullscreen__header">
              <div className="medo-site-header__logo">
                <SiteLogo />
              </div>
              <IconButton variant="ghost" size="md" icon={<X />} aria-label="Close" tooltip={false} onPress={close} />
            </div>
            <div className="medo-nav-fullscreen__nav">
              <NavList variant="sheet" aria-label="Main">
                {PAGES.map((page) => (
                  <NavItem key={page.href} href={page.href} isCurrent={isWithin(pathname, page.match)} onPress={close}>
                    {page.label}
                  </NavItem>
                ))}
              </NavList>
              <div className={styles.section}>
                {docs ? (
                  <>
                    <ToggleButtonGroup
                      aria-label="Menu content"
                      size="lg"
                      fullWidth
                      disallowEmptySelection
                      selectedKeys={view}
                      onSelectionChange={setView}
                    >
                      <ToggleButton id="contents">Contents</ToggleButton>
                      <ToggleButton id="resources">Resources</ToggleButton>
                    </ToggleButtonGroup>
                    {view.has('resources') ? resources : <DocsNav onNavigate={close} />}
                  </>
                ) : (
                  resources
                )}
              </div>
            </div>
            <div className="medo-nav-fullscreen__actions">
              <ThemeSelect size="lg" />
              <FeedbackLink size="lg" />
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}
