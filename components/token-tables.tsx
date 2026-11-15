/**
 * Token tables for foundation pages (Figma Foundation · Colors · Tokens 134:4781): one StaticTable variant="content"
 * per section, server-rendered from @med-o/design-tokens, with the columns Light · Dark · Token · Light → Dark · Usage.
 * The swatches show the token itself in a data-theme scope, so they are never a copied color. Usage is the first
 * sentence of the token's own description; Light → Dark names the palette steps behind the token, or the value
 * for palette tokens, which do not change with the theme. Nothing here reaches the browser.
 */
import { StaticTable } from '@med-o/ui';
import { Swatch } from './color-samples';
import { getTokenGroup, type DocToken } from './tokens';

/** "neutral/50" → "neutral-50", as the palette steps are written in Figma and in class names. */
const step = (ref: string) => ref.replaceAll('/', '-');

function lightToDark(token: DocToken) {
  if (!token.ref) return String(token.light);
  return `${step(token.ref)} → ${step(token.darkRef ?? token.ref)}`;
}

/** The first sentence of a description: the rest explains details the token table does not need. */
const usage = (description = '') => /^.*?[.!?](?=\s|$)/.exec(description)?.[0] ?? description;

export interface TokenTableProps {
  /** Token groups as in the token docs: "surface", "text", "slate" … Only their color tokens are listed. */
  groups: string[];
  /** Names the table for screen readers, e.g. "Surface tokens". */
  label: string;
}

export async function TokenTable({ groups, label }: TokenTableProps) {
  const tokens = (await Promise.all(groups.map(getTokenGroup))).flatMap((group) => group.tokens).filter((t) => t.type === 'color');
  if (!tokens.length) throw new Error(`Token table "${label}": the groups ${groups.join(', ')} hold no color tokens`);

  return (
    <StaticTable variant="content" caption={label} captionHidden>
      <thead>
        <tr>
          <th scope="col">Light</th>
          <th scope="col">Dark</th>
          <th scope="col">Token</th>
          <th scope="col">Light → Dark</th>
          <th scope="col">Usage</th>
        </tr>
      </thead>
      <tbody>
        {tokens.map((token) => (
          <tr key={token.name}>
            <td>
              <Swatch token={token} theme="light" />
            </td>
            <td>
              <Swatch token={token} theme="dark" />
            </td>
            <td className="medo-table__cell--code">{token.name}</td>
            <td className="medo-table__cell--code medo-text-secondary">{lightToDark(token)}</td>
            <td className="medo-text-secondary">{usage(token.description)}</td>
          </tr>
        ))}
      </tbody>
    </StaticTable>
  );
}
