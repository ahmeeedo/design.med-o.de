/**
 * The Feedback section at the end of every docs page and tab (Figma Site/Feedback 120:3529): a "##" heading, as in
 * the design and in "On this page", and a box with a short text and one button that opens a prefilled issue in the
 * docs repo. The template adds it; MDX never does, so it is not part of the content schema.
 * Desktop: text and button side by side; below 640 px the button moves under the text (Mobile layout).
 */
import { Button, Stack } from '@med-o/ui';
import { ExternalLink } from 'lucide-react';
import { FEEDBACK_URL, issueUrl } from './site-data';
import styles from './feedback-section.module.css';

/** The heading's id; "On this page" links to it. */
export const FEEDBACK_ID = 'feedback';

/** The box's texts when the page brings none. */
const DEFAULT_TEXT = {
  title: 'Help us improve this page',
  text: 'Something missing or wrong? Open an issue on GitHub – or start a discussion.',
};

export function FeedbackSection({
  title,
  route,
  text = DEFAULT_TEXT,
}: {
  title: string;
  route: string;
  /** Own heading and text of the box, e.g. on the Changelog. */
  text?: { title: string; text: string };
}) {
  return (
    <section className="medo-prose" data-pagefind-ignore="all">
      <h2 id={FEEDBACK_ID}>Feedback</h2>
      <Stack direction="horizontal" gap="items" align="center" className={styles.box}>
        <Stack gap="inline" className={styles.text}>
          <p className="medo-text-label-md-strong">{text.title}</p>
          <p className="medo-text-body-sm medo-text-secondary">{text.text}</p>
        </Stack>
        <Button
          variant="secondary"
          href={issueUrl(FEEDBACK_URL, `Feedback: ${title}`, `Page: ${route}`)}
          target="_blank"
          endIcon={<ExternalLink />}
        >
          Open an issue
        </Button>
      </Stack>
    </section>
  );
}
