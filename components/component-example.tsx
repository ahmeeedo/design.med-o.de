/**
 * Live examples on component pages (Figma Component · Guidelines 106:3625): the real component from @med-o/ui in a
 * frame, so the example follows Light, Dark and the brand like the product does. Example is the frame alone (do and
 * don't), ExampleTile adds a label below (the variants at a glance), ExampleRow puts a title and text next to it
 * (variants in detail). Server components; the example inside decides what reaches the browser.
 */
import type { ReactNode } from 'react';
import { Stack } from '@med-o/ui';
import styles from './component-example.module.css';

export function Example({ children }: { children: ReactNode }) {
  return <div className={styles.frame}>{children}</div>;
}

export function ExampleTile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Stack gap="inline">
      <Example>{children}</Example>
      <p className="medo-text-label-md-strong">{label}</p>
    </Stack>
  );
}

export function ExampleRow({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  return (
    <div className={styles.row}>
      <Example>{children}</Example>
      <Stack gap="inline">
        <h3 className="medo-text-heading-sm">{title}</h3>
        <p className="medo-text-body-md medo-text-secondary">{body}</p>
      </Stack>
    </div>
  );
}
