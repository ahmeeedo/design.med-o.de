/**
 * "On this page" for the docs render: the library OnThisPage, minus the sections a page hides at the moment. A page
 * that filters its content, such as the Changelog, removes or hides sections on the client; their links would lead
 * nowhere, so they leave the list too (Figma 145:6568 lists only the versions that match). The static HTML lists
 * every section; the list follows the page's DOM after hydration.
 */
'use client';

import { useEffect, useState } from 'react';
import { OnThisPage, type OnThisPageItem } from '@med-o/ui';

/** A section counts as shown while its target exists and no ancestor hides it. */
const shown = (id: string) => {
  const target = document.getElementById(id);
  return !!target && !target.closest('[hidden]');
};

export function DocsOutline({ items, variant }: { items: OnThisPageItem[]; variant: 'rail' | 'disclosure' }) {
  const [visible, setVisible] = useState(items);

  useEffect(() => {
    const main = document.getElementById('main');
    if (!main) return;
    const update = () =>
      setVisible((current) => {
        const next = items.filter((item) => shown(item.id));
        return next.length === current.length && next.every((item, i) => item.id === current[i].id) ? current : next;
      });
    update();
    const observer = new MutationObserver(update);
    observer.observe(main, { subtree: true, childList: true, attributes: true, attributeFilter: ['hidden'] });
    return () => observer.disconnect();
  }, [items]);

  return <OnThisPage items={visible} variant={variant} />;
}
