/**
 * The Changelog at /docs/overview/changelog: content/docs/overview/changelog.mdx through the shared docs render, with
 * the release list as its data block. It has a route of its own (the catch-all route skips it) so that only this page
 * loads the JavaScript of the search and filters; every client component in the catch-all route's modules loads on
 * every docs page.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDoc } from '../../../../components/docs-content';
import { DocsPage, docMetadata } from '../../../../components/docs-page';
import { ReleaseList } from '../../../../components/release-list';

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getDoc('overview', 'changelog');
  return doc ? docMetadata(doc) : {};
}

export default async function Page() {
  const doc = await getDoc('overview', 'changelog');
  if (!doc) notFound();
  return <DocsPage doc={doc} components={{ ReleaseList }} />;
}
