/**
 * Theme choice: System, Light or Dark. Light and Dark set data-theme on <html> and are stored in localStorage;
 * System removes both, so the tokens follow prefers-color-scheme. ThemeScript applies the stored choice before the
 * first paint; this module keeps every theme select in sync afterwards (also across tabs).
 */
import { useSyncExternalStore } from 'react';
import { THEME_KEY } from './theme-script';

export type Theme = 'system' | 'light' | 'dark';

const listeners = new Set<() => void>();

function read(): Theme {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === 'light' || value === 'dark' ? value : 'system';
  } catch {
    return 'system';
  }
}

function apply(theme: Theme) {
  if (theme === 'system') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', theme);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== THEME_KEY) return;
    apply(read());
    onChange();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onStorage);
  };
}

export function setTheme(theme: Theme) {
  try {
    if (theme === 'system') localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage blocked: the choice still applies to this page.
  }
  apply(theme);
  listeners.forEach((listener) => listener());
}

/** The stored choice. The static build always renders "system"; the browser value follows after hydration. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, read, () => 'system');
}
