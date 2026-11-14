/**
 * The legal pages (imprint, privacy) from content/legal/<name>.mdx: a title, a short line below it and the text,
 * rendered at build time with the same MDX mapping as the docs. The front matter is checked like docs content, so a
 * broken file fails the build. The pages are not marked for search: people search the docs for content, and the
 * footer links these pages on every page.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import * as runtime from 'react/jsx-runtime';
import { evaluate } from '@mdx-js/mdx';
import { Container, Stack } from '@med-o/ui';
import { VFile } from 'vfile';
import { matter } from 'vfile-matter';
import { z } from 'zod';
import { mdxComponents } from './mdx-components';
import { PageMain } from './page-main';
import { rehypeSections } from './rehype-sections';

const FrontMatter = z.strictObject({
  title: z.string().min(1),
  excerpt: z.string().min(1),
});

export type LegalName = 'imprint' | 'privacy';

export async function getLegalPage(name: LegalName) {
  const relative = `content/legal/${name}.mdx`;
  const file = new VFile({ path: relative, value: await readFile(path.join(process.cwd(), relative), 'utf8') });
  matter(file, { strip: true });
  const result = FrontMatter.safeParse(file.data.matter);
  if (!result.success) {
    const problems = result.error.issues.map((i) => `  ${relative}: ${i.path.join('.') || 'front matter'} – ${i.message}`);
    throw new Error(`Legal content is invalid:\n${problems.join('\n')}`);
  }
  return { ...result.data, file };
}

export async function LegalPage({ name }: { name: LegalName }) {
  const page = await getLegalPage(name);
  const { default: Content } = await evaluate(page.file, { ...runtime, rehypePlugins: [rehypeSections] });

  return (
    <PageMain>
      <Container size="prose">
        <Stack gap="group">
          <Stack gap="content">
            <h1 className="medo-text-heading-xl">{page.title}</h1>
            <p className="medo-text-body-lg medo-text-secondary">{page.excerpt}</p>
          </Stack>
          <Content components={mdxComponents} />
        </Stack>
      </Container>
    </PageMain>
  );
}
