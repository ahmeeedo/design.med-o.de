/**
 * The Changelog at /docs/overview/changelog: content/docs/overview/changelog.mdx through the shared docs render, with
 * the base MDX map and the release list as its data block. It has a route of its own (the overview route skips it,
 * see components/docs-route.ts) so that only this page loads the JavaScript of the search and filters: Next ships
 * every client component in a route's modules on every page of that route.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDoc } from '../../../../components/docs-content';
import { DocsPage, docMetadata } from '../../../../components/docs-page';
import { baseComponents } from '../../../../components/mdx/base';
import { ReleaseList } from '../../../../components/release-list';

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getDoc('overview', 'changelog');
  return doc ? docMetadata(doc) : {};
}

export default async function Page() {
  const doc = await getDoc('overview', 'changelog');
  if (!doc) notFound();
  return <DocsPage doc={doc} components={{ ...baseComponents, ReleaseList }} />;
}
