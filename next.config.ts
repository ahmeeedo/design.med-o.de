/**
 * Next.js config: the site is a static export. `next build` writes plain HTML, CSS and JS to `out/`, which nginx
 * serves. There is no server logic, so redirects and headers live in nginx, not here.
 */
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: false,
  // Images are resized at build time; the export has no server to optimize them on request.
  images: { unoptimized: true },
};

export default nextConfig;
