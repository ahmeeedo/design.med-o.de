/**
 * Color samples for foundation pages, server-rendered: a swatch for one token in a given theme, a panel that shows a
 * surface with its text colors, a palette ramp and the flow of the three color layers (Figma Foundation · Colors).
 * Tokens are named as in the token docs ("surface/brand-bold", "slate/50"); an unknown name fails the build, so a
 * renamed token never shows an empty sample. Colors come only from the token variables; see color-samples.module.css.
 */
import { Children, type CSSProperties, type ReactNode } from 'react';
import { getTokenDocs, type DocToken } from './tokens';
import styles from './color-samples.module.css';

/** The token by name, from the token docs; a build error names a token that does not exist. */
export async function tokenByName(name: string): Promise<DocToken> {
  const token = (await getTokenDocs()).groups.flatMap((group) => group.tokens).find((t) => t.name === name);
  if (!token) throw new Error(`Color sample: no token "${name}" in @med-o/design-tokens`);
  return token;
}

/** A custom property that points to the token's CSS variable, e.g. { '--surface': 'var(--medo-color-surface-subtle)' }. */
const tokenVar = (property: string, token: DocToken) => ({ [property]: `var(${token.cssVar})` }) as CSSProperties;

/** One token as a square swatch, in the theme given – Light and Dark side by side in token tables. Decorative. */
export function Swatch({ token, theme }: { token: DocToken; theme: 'light' | 'dark' }) {
  return (
    <span data-theme={theme} aria-hidden="true" className={styles.swatch} style={tokenVar('--swatch', token)} />
  );
}

export interface ColorSampleProps {
  /** The background token, e.g. "surface/brand-bold". */
  surface: string;
  /**
   * tile: a card-like panel with title and text · example: one centered line on a larger panel, exposed as an image
   * named by the line, so a don't sample can show a failing pair. Default tile.
   */
  variant?: 'tile' | 'example';
  title?: string;
  /** A real heading (h3) when the title names a topic; a paragraph when it is sample content. Default p. */
  titleAs?: 'h3' | 'p';
  body: string;
  /** Token of the title (tile) or of the one line (example). Default text/primary. */
  titleColor?: string;
  /** Token of the body text in a tile. Default text/secondary. */
  bodyColor?: string;
  /** Palette or semantic tokens shown as a row of chips above the title. */
  chips?: string[];
  /** A line below the panel in code type, e.g. the tokens it uses. */
  caption?: string;
  /** Example only: the pair fails contrast on purpose (a don't sample). The a11y test skips its contrast check. */
  failing?: boolean;
}

/** A surface with its text: principle tiles, brand surface examples and do and don't samples. */
export async function ColorSample({
  surface,
  variant = 'tile',
  title,
  titleAs: Title = 'p',
  body,
  titleColor = 'text/primary',
  bodyColor,
  chips = [],
  caption,
  failing = false,
}: ColorSampleProps) {
  const [surfaceToken, textToken, secondaryToken, chipTokens] = await Promise.all([
    tokenByName(surface),
    tokenByName(titleColor),
    tokenByName(bodyColor ?? (variant === 'example' ? titleColor : 'text/secondary')),
    Promise.all(chips.map(tokenByName)),
  ]);
  const style = { ...tokenVar('--surface', surfaceToken), ...tokenVar('--text', textToken), ...tokenVar('--secondary', secondaryToken) };

  const panel =
    variant === 'example' ? (
      // A sample of a color pair, shown as a picture: the text names the pair, and a don't sample may fail contrast
      // on purpose. Screen readers get the same words once, as the image name.
      <div className={`${styles.panel} ${styles.example}`} style={style} role="img" aria-label={body} data-contrast-example={failing || undefined}>
        <p className="medo-text-body-md" aria-hidden="true">
          {body}
        </p>
      </div>
    ) : (
      <div className={`${styles.panel} ${chips.length ? styles.tile : ''}`} style={style}>
        {chipTokens.length > 0 && (
          <span className={styles.chips} aria-hidden="true">
            {chipTokens.map((token) => (
              <span key={token.name} className={styles.chip} style={tokenVar('--swatch', token)} />
            ))}
          </span>
        )}
        {title && <Title className="medo-text-heading-sm">{title}</Title>}
        <p className={`medo-text-body-sm ${styles.secondary}`}>{body}</p>
      </div>
    );

  if (!caption) return panel;
  return (
    <div className="medo-stack medo-gap-inline">
      {panel}
      <p className="medo-text-code-sm medo-text-secondary" translate="no">
        {caption}
      </p>
    </div>
  );
}

/** One palette family as a ramp: a swatch per step with its number and hex value, from the token docs. */
export async function PaletteRamp({ group, label, alias }: { group: string; label: string; alias?: string }) {
  const docs = await getTokenDocs();
  const steps = docs.groups.find((g) => g.id === group)?.tokens.filter((t) => t.type === 'color');
  if (!steps?.length) throw new Error(`Palette ramp: no color group "${group}" in @med-o/design-tokens`);

  return (
    <div className="medo-stack medo-gap-inline">
      <p>
        <span className="medo-text-label-md-strong">{label}</span>
        {alias && <span className="medo-text-body-sm medo-text-secondary"> ({alias})</span>}
      </p>
      <ul className={styles.ramp} aria-label={`${label} palette`}>
        {steps.map((token) => (
          <li key={token.name} className={styles.step}>
            <span className={styles.stepSwatch} style={tokenVar('--swatch', token)} />
            <span className="medo-text-label-md-strong">{token.path.at(-1)}</span>
            <span className="medo-text-caption medo-text-secondary" translate="no">
              {String(token.light)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Blocks in a row with an arrow between each pair – the color layers. The blocks stack below 640 px. */
export function ColorFlow({ children }: { children: ReactNode }) {
  const blocks = Children.toArray(children);
  return (
    <div className={styles.flow}>
      {blocks.flatMap((block, index) => [
        ...(index > 0
          ? [
              <span key={`arrow-${index}`} className={`medo-text-heading-sm medo-text-secondary ${styles.arrow}`} aria-hidden="true">
                →
              </span>,
            ]
          : []),
        block,
      ])}
    </div>
  );
}
