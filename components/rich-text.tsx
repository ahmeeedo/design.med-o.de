/**
 * Text from the package manifest as it is written there: plain sentences with inline code in backticks
 * ("Submit a form (`type="submit"`)."). The code parts render as the library Code, the rest as text. Server-safe.
 */
import { Code } from '@med-o/ui';

export function RichText({ text }: { text: string }) {
  const parts = text.split(/`([^`]+)`/);
  return <>{parts.map((part, index) => (index % 2 === 1 ? <Code key={index}>{part}</Code> : part))}</>;
}
