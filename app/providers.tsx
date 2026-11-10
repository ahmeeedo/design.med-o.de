/**
 * App-wide React context. Context needs a client component, so the server layout wraps the page in this one.
 * - I18nProvider: the locale formats dates and numbers and picks the built-in texts. Same language as <html lang>.
 * - RouterProvider: links and menus of @med-o/ui navigate with the Next.js router instead of a full page load.
 */
'use client';

import { useRouter } from 'next/navigation';
import { I18nProvider, RouterProvider } from 'react-aria-components';

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <I18nProvider locale="en-US">
      <RouterProvider navigate={router.push}>{children}</RouterProvider>
    </I18nProvider>
  );
}
