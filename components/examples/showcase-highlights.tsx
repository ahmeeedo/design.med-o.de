/**
 * Showcase highlights (Figma 67:1058): the library Carousel (row) of six filled cards, running to the right edge of
 * the screen. Each names the components it is built from and holds the live example it describes – the same
 * examples as on Home.
 */
'use client';

import type { ReactNode } from 'react';
import { Card, Carousel } from '@med-o/ui';
import { SettingsExample, SignInExample, TeamExample } from './home-app';
import { CheckoutExample, TrackingExample } from './home-commerce';
import { PlayerExample } from './home-lifestyle';

const HIGHLIGHTS: { title: string; components: string; body: ReactNode }[] = [
  { title: 'Sign-in form', components: 'Field · Button · Link', body: <SignInExample /> },
  { title: 'Audio player', components: 'Image · Slider · Icon Button', body: <PlayerExample /> },
  { title: 'Checkout', components: 'Radio group · Button', body: <CheckoutExample /> },
  { title: 'Settings', components: 'Select · Switch', body: <SettingsExample /> },
  { title: 'Package tracking', components: 'Badge · Stepper · Link', body: <TrackingExample /> },
  { title: 'Team', components: 'Input · List row · Avatar', body: <TeamExample /> },
];

export function ShowcaseHighlights() {
  return (
    <Carousel title="Highlights" layout="row" itemSize="lg" bleed>
      {HIGHLIGHTS.map((highlight) => (
        <Card key={highlight.title} title={highlight.title} subtitle={highlight.components} variant="filled" headingLevel={3}>
          {highlight.body}
        </Card>
      ))}
    </Carousel>
  );
}
