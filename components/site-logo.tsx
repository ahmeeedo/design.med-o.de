/**
 * Site logo: wordmark plus "Design System", a link to the home page. Both wordmark files are in the HTML; CSS shows
 * the one that fits the theme, so the logo is right before any script runs.
 */
import Image from 'next/image';
import NextLink from 'next/link';
import styles from './site-logo.module.css';

// Intrinsic size of the SVGs (viewBox 1000 × 233.84). CSS sets the rendered height.
const SIZE = { width: 1000, height: 234 };

export function SiteLogo() {
  return (
    <NextLink href="/" className={styles.logo} aria-label="med.o Design System home">
      <Image src="/logo-rgb.svg" alt="" {...SIZE} priority className={`${styles.wordmark} ${styles.rgb}`} />
      <Image src="/logo-white.svg" alt="" {...SIZE} priority className={`${styles.wordmark} ${styles.white}`} />
      <span className={styles.divider} aria-hidden="true" />
      <span className="medo-text-label-md">Design System</span>
    </NextLink>
  );
}
