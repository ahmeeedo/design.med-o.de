/**
 * "Give feedback": a secondary Button that links to a new GitHub issue in a new tab. The hidden new-tab text and
 * rel="noopener noreferrer" come from the component.
 */
'use client';

import { Button } from '@med-o/ui';
import { ExternalLink } from 'lucide-react';
import { FEEDBACK_URL } from './site-data';

export function FeedbackLink({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <Button variant="secondary" size={size} href={FEEDBACK_URL} target="_blank" endIcon={<ExternalLink />}>
      Give feedback
    </Button>
  );
}
