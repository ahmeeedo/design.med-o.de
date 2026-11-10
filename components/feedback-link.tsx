/**
 * "Give feedback": a link that looks like a secondary Button and opens a new GitHub issue in a new tab.
 * Button has no href, so this uses the Button classes on a React Aria Link – the way SiteHeader renders its actions.
 */
'use client';

import { Link } from 'react-aria-components';
import { ExternalLink } from 'lucide-react';
import { FEEDBACK_URL } from './site-data';

export function FeedbackLink({ size = 'md', className }: { size?: 'md' | 'lg'; className?: string }) {
  return (
    <Link
      href={FEEDBACK_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={['medo-button', 'medo-button--secondary', `medo-button--${size}`, className].filter(Boolean).join(' ')}
    >
      <span className="medo-button__label">Give feedback</span>
      <span className="medo-button__icon" aria-hidden="true">
        <ExternalLink />
      </span>
      <span className="medo-visually-hidden"> (opens in a new tab)</span>
    </Link>
  );
}
