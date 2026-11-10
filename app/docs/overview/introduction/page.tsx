/** Temporary docs page to check the docs layout. The MDX content pipeline replaces this route. */
import type { Metadata } from 'next';
import { Container, Stack } from '@med-o/ui';
import text from '../../../../components/text.module.css';

export const metadata: Metadata = { title: 'Introduction · med.o Design System' };

export default function Introduction() {
  return (
    <Container size="prose">
      <Stack gap="content">
        <h1 className="medo-text-heading-xl">Introduction</h1>
        <p className={`medo-text-body-lg ${text.secondary}`}>
          The med.o Design System gives you components, tokens and guidelines to build accessible med.o products.
        </p>
      </Stack>
    </Container>
  );
}
