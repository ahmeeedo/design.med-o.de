/**
 * robots.txt: every crawler may read every page, and the sitemap is named. Dev and preview stay out of search results
 * through the X-Robots-Tag header in nginx.conf, not through this file, so all hosts can serve the same build.
 */
import type { MetadataRoute } from 'next';
import { SITE_URL } from '../components/site-metadata';

// The static export writes the file at build time only for routes marked static; without it the build stops.
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: new URL('/sitemap.xml', SITE_URL).href,
  };
}
