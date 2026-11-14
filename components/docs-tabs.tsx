/**
 * The tab list of component and foundation pages (Figma Site/Page header 104:2063): the library Tabs with one link
 * per tab, so every tab is its own route. The current tab is selected; its content sits in the one TabPanel, as
 * React Aria expects for tabs that link. Arrow keys move between the tabs and Enter opens one (manual activation),
 * so moving through the list does not load a page per key press. Below 640 px the library list scrolls sideways.
 * Pages without tabs render the header and the content as they are.
 */
'use client';

import type { ReactNode } from 'react';
import { Stack, Tab, TabList, TabPanel, Tabs } from '@med-o/ui';

export function DocsTabs({
  tabs,
  current,
  header,
  children,
}: {
  tabs: { label: string; href: string }[];
  current: string;
  header: ReactNode;
  children: ReactNode;
}) {
  if (tabs.length === 0) {
    return (
      <Stack gap="group">
        {header}
        {children}
      </Stack>
    );
  }

  // The header stays outside Tabs: React Aria renders the children of Tabs once more, hidden, to collect the tabs.
  return (
    <Stack gap="content">
      {header}
      <Tabs selectedKey={current} keyboardActivation="manual">
        <Stack gap="group">
          <div data-pagefind-ignore="all">
            <TabList aria-label="Page sections">
              {tabs.map((tab) => (
                <Tab key={tab.href} id={tab.href} href={tab.href}>
                  {tab.label}
                </Tab>
              ))}
            </TabList>
          </div>
          <TabPanel id={current}>{children}</TabPanel>
        </Stack>
      </Tabs>
    </Stack>
  );
}
