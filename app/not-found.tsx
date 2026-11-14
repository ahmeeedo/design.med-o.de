/** 404 page: the static export writes it as 404.html, which nginx serves for unknown paths. */
import type { Metadata } from 'next';
import { Container, Link, Stack } from '@med-o/ui';
import { PageMain } from '../components/page-main';

export const metadata: Metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <PageMain>
      <Container size="prose">
        <Stack gap="content" align="start">
          <h1 className="medo-text-heading-xl">Page not found</h1>
          <p className="medo-text-body-lg medo-text-secondary">This page does not exist or has moved.</p>
          <Link href="/" variant="standalone" arrow>
            Go to the home page
          </Link>
        </Stack>
      </Container>
    </PageMain>
  );
}
