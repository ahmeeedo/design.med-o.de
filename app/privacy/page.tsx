/** Privacy policy: the text lives in content/legal/privacy.mdx. */
import type { Metadata } from 'next';
import { getLegalPage, LegalPage } from '../../components/legal-page';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage('privacy');
  return { title: `${page.title} · med.o Design System`, description: page.excerpt };
}

export default function Page() {
  return <LegalPage name="privacy" />;
}
