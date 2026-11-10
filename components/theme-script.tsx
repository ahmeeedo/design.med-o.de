/**
 * Applies the stored theme before the first paint, so the page never flashes in the wrong theme.
 * Runs inline in <head> while the browser parses the HTML; <html> carries suppressHydrationWarning because the
 * script may add data-theme before React hydrates.
 */
/** localStorage key of the theme choice. */
export const THEME_KEY = 'theme';

const script = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
