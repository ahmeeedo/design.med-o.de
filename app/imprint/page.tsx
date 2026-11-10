/** Imprint: the text lives in content/legal/imprint.mdx. */
import type { Metadata } from 'next';
import { getLegalPage, LegalPage } from '../../components/legal-page';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage('imprint');
  return { title: `${page.title} · med.o Design System`, description: page.excerpt };
}

export default function Page() {
  return <LegalPage name="imprint" />;
}
