/**
 * "Before you update" (Figma 69:1061): the breaking changes of one version in a warning Alert – what changed, then the
 * "Update:" sentence that says what to do. Updates shows it above the version's changes; the Changelog can use it the
 * same way. No hooks, so it renders on the server and in client lists alike.
 */
import { Alert, Stack } from '@med-o/ui';
import type { VersionEntry } from './changelog';
import { plainSummary } from './release';

export function BeforeYouUpdate({ entries }: { entries: VersionEntry[] }) {
  const breaking = entries.filter((entry) => entry.breaking);
  if (breaking.length === 0) return null;
  return (
    <Alert tone="warning" title="Before you update">
      <Stack gap="inline">
        {breaking.map((entry) => (
          <p key={entry.key}>
            {plainSummary([entry.breaking!.text, entry.breaking!.update].filter(Boolean).join(' '))}
          </p>
        ))}
      </Stack>
    </Alert>
  );
}
