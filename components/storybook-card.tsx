/**
 * The Code tab's card (Figma Site/Card link 116:2175): React, the package, and one external link to the component's
 * Storybook page, where props, examples and the source live – generated from the code, so they are never written
 * twice. The card itself is not a link, so there is only one link to tab to.
 */
import { Card, Link } from '@med-o/ui';
import { storybookUrl, type ManifestComponent } from './manifest';
import styles from './storybook-card.module.css';

export function StorybookCard({ entry }: { entry: ManifestComponent }) {
  return (
    <div className={styles.card}>
      <Card title="React" subtitle="@med-o/ui · Props, examples and source">
        <Link href={storybookUrl(entry.storybookId)} variant="standalone" size="md" external target="_blank">
          Open in Storybook
        </Link>
      </Card>
    </div>
  );
}
