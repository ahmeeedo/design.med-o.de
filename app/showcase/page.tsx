/** Showcase – placeholder until the showcase is built. */
import type { Metadata } from 'next';
import { Container, Stack } from '@med-o/ui';
import { PageMain } from '../../components/page-main';
import text from '../../components/text.module.css';

export const metadata: Metadata = { title: 'Showcase · med.o Design System' };

export default function Showcase() {
  return (
    <PageMain>
      <Container size="prose">
        <Stack gap="content">
          <h1 className="medo-text-heading-xl">Showcase</h1>
          <p className={`medo-text-body-lg ${text.secondary}`}>Here you see real interfaces built with the system.</p>
        </Stack>
      </Container>
    </PageMain>
  );
}
