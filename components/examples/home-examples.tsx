/**
 * The live examples on Home: three sets (App, E-Commerce, Lifestyle) switched with the library Tabs, as the Figma
 * frames 37:2288, 55:4578 and 55:5594 show. The tab list sits under the intro, the selected set on the right; the
 * Tabs element itself takes no box (display: contents) so both join the hero's grid.
 * Only the App set loads with the page. E-Commerce and Lifestyle load when their tab is chosen (next/dynamic), so
 * their components do not count against the page's JavaScript; panels of other tabs are not kept in the DOM.
 */
'use client';

import dynamic from 'next/dynamic';
import { Tab, TabList, TabPanel, Tabs } from '@med-o/ui';
import { HomeApp } from './home-app';
import styles from './home-examples.module.css';

const HomeCommerce = dynamic(() => import('./home-commerce').then((m) => m.HomeCommerce));
const HomeLifestyle = dynamic(() => import('./home-lifestyle').then((m) => m.HomeLifestyle));

export function HomeExamples() {
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
