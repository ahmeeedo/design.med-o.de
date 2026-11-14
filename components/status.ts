/**
 * How a page status shows: its label and the Badge tone. The hero shows every status; the sidebar skips "stable",
 * because the Figma sidebar marks only pages that are not stable.
 */
import type { BadgeTone } from '@med-o/ui';
import type { Status } from './docs-content';

export const STATUS: Record<Status, { label: string; tone: BadgeTone }> = {
  experimental: { label: 'Experimental', tone: 'warning' },
  beta: { label: 'Beta', tone: 'info' },
  stable: { label: 'Stable', tone: 'success' },
  deprecated: { label: 'Deprecated', tone: 'danger' },
};
