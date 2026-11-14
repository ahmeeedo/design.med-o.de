/** Imprint: the text lives in content/legal/imprint.mdx. */
import type { Metadata } from 'next';
import { getLegalPage, LegalPage } from '../../components/legal-page';
import { pageMetadata } from '../../components/site-metadata';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage('imprint');
  return pageMetadata({ title: page.title, description: page.excerpt, path: '/imprint' });
}

export default function Page() {
  return <LegalPage name="imprint" />;
}
