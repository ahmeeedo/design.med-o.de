/**
 * The Changelog's release list as an MDX data block (<ReleaseList />): every version of both packages from the
 * installed changelogs, with search and filters. Its version headings join "On this page" through DATA_BLOCKS in
 * docs-page.tsx. The URL-bound filters read useSearchParams, which a static export renders in the browser only, so
 * the Suspense fallback – the same view without a URL – puts every version into the HTML.
 */
import { Suspense } from 'react';
import { getVersions } from './changelog';
import { ChangelogFromUrl, ChangelogView } from './changelog-filters';

export async function ReleaseList() {
  const versions = await getVersions();
  return (
    <Suspense fallback={<ChangelogView versions={versions} />}>
      <ChangelogFromUrl versions={versions} />
    </Suspense>
  );
}
