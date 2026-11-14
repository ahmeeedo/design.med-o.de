/**
 * Home – placeholder until the home page is built: title, one sentence and the install command.
 * The command is highlighted at build time; no highlighting code reaches the browser.
 */
import type { Metadata } from 'next';
import { CodeBlock, Container, Stack } from '@med-o/ui';
import { highlight } from '@med-o/ui/highlight';
import { PageMain } from '../components/page-main';
import { pageMetadata } from '../components/site-metadata';

export const metadata: Metadata = pageMetadata({ path: '/' });

const INSTALL = 'npm install @med-o/ui @med-o/design-tokens';

export default async function Home() {
  return (
    <PageMain>
      <Container size="prose">
        <Stack gap="content" data-pagefind-body data-pagefind-meta="area:Pages">
          <h1 className="medo-text-heading-xl">med.o Design System</h1>
          <p className="medo-text-body-lg medo-text-secondary">
            Components, tokens and guidelines for med.o products. Install the packages and start with your first page.
          </p>
          <div translate="no">
            <CodeBlock
              code={INSTALL}
              language="bash"
              tokens={await highlight(INSTALL, 'bash')}
              copyable
              aria-label="Install command"
            />
          </div>
        </Stack>
      </Container>
    </PageMain>
  );
}
