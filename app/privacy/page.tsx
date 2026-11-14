/** Privacy policy: the text lives in content/legal/privacy.mdx. */
import type { Metadata } from 'next';
import { getLegalPage, LegalPage } from '../../components/legal-page';
import { pageMetadata } from '../../components/site-metadata';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage('privacy');
  return pageMetadata({ title: page.title, description: page.excerpt, path: '/privacy' });
}

export default function Page() {
  return <LegalPage name="privacy" />;
}
