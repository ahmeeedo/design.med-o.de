/**
 * The live examples of Home and Showcase, loaded after the page (next/dynamic, client only). The static HTML holds
 * the page's text, headings and links; the examples are demos and follow once the page runs. A Skeleton of about
 * their size keeps the place, so nothing below them moves when they arrive.
 * Why not in the HTML: rendered there, Home loads 337.5 kB of JavaScript at first, over the 270 kB budget.
 */
'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@med-o/ui';

/** A placeholder of the examples' height while their code loads. */
const placeholder = (height: string) =>
  function Placeholder() {
    return <Skeleton shape="rect" width="100%" height={height} />;
  };

export const HomeExamples = dynamic(() => import('./home-examples').then((m) => m.HomeExamples), {
  ssr: false,
  loading: placeholder('var(--medo-size-width-xl)'),
});

export const ShowcaseHighlights = dynamic(() => import('./showcase-highlights').then((m) => m.ShowcaseHighlights), {
  ssr: false,
  loading: placeholder('var(--medo-size-width-3xl)'),
});

export const ShowcaseThemeCompare = dynamic(() => import('./showcase-theme-compare').then((m) => m.ShowcaseThemeCompare), {
  ssr: false,
  loading: placeholder('var(--medo-size-width-5xl)'),
});
