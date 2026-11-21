/**
 * The live examples on Home: three sets (App, E-Commerce, Lifestyle) switched with the library Tabs, as the Figma
 * frames 37:2288, 55:4578 and 55:5594 show. The tab list sits under the intro, the selected set on the right; the
 * Tabs element itself takes no box (display: contents) so both join the hero's grid.
 * Only the App set loads with the page. E-Commerce and Lifestyle are separate chunks (next/dynamic), so they do not
 * count against the page's JavaScript; the page fetches them once it is idle, so the first switch shows them at once
 * instead of an empty panel. Should a tab come first, a Skeleton of the wall's height holds the place. Panels of
 * other tabs are not kept in the DOM.
 */
'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton, Tab, TabList, TabPanel, Tabs } from '@med-o/ui';
import { HomeApp } from './home-app';
import styles from './home-examples.module.css';

const loadCommerce = () => import('./home-commerce');
const loadLifestyle = () => import('./home-lifestyle');
const loading = () => <Skeleton shape="rect" width="100%" height="var(--medo-size-width-xl)" />;
const HomeCommerce = dynamic(() => loadCommerce().then((m) => m.HomeCommerce), { loading });
const HomeLifestyle = dynamic(() => loadLifestyle().then((m) => m.HomeLifestyle), { loading });

export function HomeExamples() {
  // The other two sets, fetched in the browser's idle time (after about 1.5 s where there is no idle callback).
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((callback: () => void) => window.setTimeout(callback, 1500));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(() => {
      void loadCommerce();
      void loadLifestyle();
    });
    return () => cancel(id);
  }, []);

  return (
    <Tabs defaultSelectedKey="app" className={styles.tabs}>
      <div className={styles.switch} data-pagefind-ignore="all">
        <p className="medo-text-caption medo-text-secondary" id="live-examples">
          Live examples
        </p>
        <TabList aria-labelledby="live-examples">
          <Tab id="app">App</Tab>
          <Tab id="commerce">E-Commerce</Tab>
          <Tab id="lifestyle">Lifestyle</Tab>
        </TabList>
      </div>
      <TabPanel id="app" keepMounted={false} className={styles.panel}>
        <HomeApp />
      </TabPanel>
      <TabPanel id="commerce" keepMounted={false} className={styles.panel}>
        <HomeCommerce />
      </TabPanel>
      <TabPanel id="lifestyle" keepMounted={false} className={styles.panel}>
        <HomeLifestyle />
      </TabPanel>
    </Tabs>
  );
}
