/**
 * The live examples of one Home set (Figma "Example wall", 37:2319): from 1024 px three columns of cards, 320 px or wider,
 * staggered and cropped by the screen edge as in the design; below it the same cards as a row in the library
 * Carousel (78:2827). Both forms are in the HTML and CSS shows one, so the static page is right at every width;
 * the hidden form is display: none and stays out of the tab order and the accessibility tree.
 */
'use client';

import type { ReactNode } from 'react';
import { Card, Carousel } from '@med-o/ui';
import styles from './example-wall.module.css';

export interface ExampleCard {
  title: string;
  subtitle: string;
  body: ReactNode;
}

export function ExampleWall({ label, columns, row }: { label: string; columns: ExampleCard[][]; row: ExampleCard[] }) {
  // The row uses compact cards (padding 16), as the mobile design does.
  const card = (density: 'standard' | 'compact') =>
    function ExampleCardView(example: ExampleCard, index: number) {
      return (
        <Card key={`${example.title}-${index}`} title={example.title} subtitle={example.subtitle} headingLevel={2} density={density}>
          {example.body}
        </Card>
      );
    };

  return (
    <>
      <div className={styles.wall}>
        {columns.map((column, index) => (
          <div key={index} className={styles.column}>
            {column.map(card('standard'))}
          </div>
        ))}
      </div>
      <div className={styles.row}>
        <Carousel layout="row" itemSize="lg" aria-label={label}>
          {row.map(card('compact'))}
        </Carousel>
      </div>
    </>
  );
}
