/** Updates – placeholder until the release notes are built. */
import type { Metadata } from 'next';
import { Container, Stack } from '@med-o/ui';
import { PageMain } from '../../components/page-main';
import { pageMetadata } from '../../components/site-metadata';

export const metadata: Metadata = pageMetadata({ title: 'Updates', path: '/updates' });

export default function Updates() {
  return (
    <PageMain>
      <Container size="prose">
        <Stack gap="content" data-pagefind-body data-pagefind-meta="area:Pages">
          <h1 className="medo-text-heading-xl">Updates</h1>
          <p className="medo-text-body-lg medo-text-secondary">
            Here you find the latest releases of <span translate="no">@med-o/ui</span> and{' '}
            <span translate="no">@med-o/design-tokens</span>, newest first.
          </p>
        </Stack>
      </Container>
    </PageMain>
  );
}
