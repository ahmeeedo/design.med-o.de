/**
 * "Give feedback": a secondary Button that links to a new GitHub issue in a new tab. The hidden new-tab text and
 * rel="noopener noreferrer" come from the component. `compact` is the same link as an Icon Button, for the header
 * between 768 and 1023 px, where the full button does not fit next to the theme select.
 */
'use client';

import { Button, IconButton } from '@med-o/ui';
import { ExternalLink, MessageSquarePlus } from 'lucide-react';
import { FEEDBACK_URL } from './site-data';

export function FeedbackLink({ size = 'md', compact, className }: { size?: 'md' | 'lg'; compact?: boolean; className?: string }) {
  if (compact) {
    return (
      <IconButton
        variant="secondary"
        size={size}
        icon={<MessageSquarePlus />}
        aria-label="Give feedback"
        href={FEEDBACK_URL}
        target="_blank"
        className={className}
      />
    );
  }
  return (
    <Button variant="secondary" size={size} href={FEEDBACK_URL} target="_blank" endIcon={<ExternalLink />} className={className}>
      Give feedback
    </Button>
  );
}
