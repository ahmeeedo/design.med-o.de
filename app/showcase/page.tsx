/** Showcase – placeholder until the showcase is built. */
import type { Metadata } from 'next';
import { Container, Stack } from '@med-o/ui';
import { PageMain } from '../../components/page-main';
import { pageMetadata } from '../../components/site-metadata';
import text from '../../components/text.module.css';

export const metadata: Metadata = pageMetadata({ title: 'Showcase', path: '/showcase' });

export default function Showcase() {
  return (
    <PageMain>
      <Container size="prose">
        <Stack gap="content" data-pagefind-body data-pagefind-meta="area:Pages">
          <h1 className="medo-text-heading-xl">Showcase</h1>
          <p className={`medo-text-body-lg ${text.secondary}`}>Here you see real interfaces built with the system.</p>
        </Stack>
      </Container>
    </PageMain>
  );
}
