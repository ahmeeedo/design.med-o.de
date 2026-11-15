/**
 * A card for one component under "Related" (Figma Pattern · Form 127:4083): the title and line the page gives, the
 * component's status Badge from the package manifest, and a link to its docs page here or, while there is none, to
 * Storybook. The component is named as in the manifest ("Text Field"), so a typo or a removed component fails the
 * build (getComponent throws). Server component: the manifest and the docs list are read at build time.
 */
import { Badge, Card } from '@med-o/ui';
import { getDocs } from './docs-content';
import { getComponent, storybookUrl } from './manifest';
import { STATUS } from './status';

export interface RelatedComponentProps {
  /** The name in the manifest, e.g. "Text Field". */
  component: string;
  /** The card title; defaults to the manifest name. */
  title?: string;
  /** One line on what the component does here. */
  subtitle: string;
}

export async function RelatedComponent({ component, title, subtitle }: RelatedComponentProps) {
  const entry = await getComponent(component);
  const page = (await getDocs()).find((doc) => doc.type === 'component' && doc.component === component);
  const { label, tone } = STATUS[entry.status];

  return (
    <Card title={title ?? entry.name} subtitle={subtitle} href={page?.pageHref ?? storybookUrl(entry.storybookId)} density="compact">
      <Badge tone={tone} size="sm">
        {label}
      </Badge>
    </Card>
  );
}
