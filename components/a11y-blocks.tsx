/**
 * Accessibility blocks of component pages, from the package manifest (`a11y` in the stories; Figma Component ·
 * Accessibility 107:2591): what the component provides, the keyboard table, the testing status with one row per
 * screen reader and the screen reader steps, which lead through the Playground. "Report a result" opens a prefilled
 * issue in the design system repo, the same template Storybook uses. Optional data stays optional: a component
 * without keyboard data, notes or a screen reader test shows no table for it, and an untested screen reader says so.
 */
import { Badge, Link, List, ListItem, StaticTable } from '@med-o/ui';
import type { ManifestComponent } from './manifest';
import { RichText } from './rich-text';
import { RESOURCES, storybookDocsUrl } from './site-data';

const REPO = RESOURCES.find((r) => r.label === 'GitHub')!.href;
const GUIDE_ID = 'guides-screen-reader-testing--docs';
const READERS = [
  { id: 'nvda', name: 'NVDA', setup: 'Windows' },
  { id: 'voiceover', name: 'VoiceOver', setup: 'iPhone' },
  { id: 'talkback', name: 'TalkBack', setup: 'Android' },
] as const;
const DATE = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });

type Steps = [string, string][];

/** A new issue from the "Screen reader test" template, with component, screen reader and steps filled in. */
function reportUrl(component: string, reader: (typeof READERS)[number], steps: Steps) {
  const query = new URLSearchParams({
    template: 'screen-reader-test.yml',
    title: `Screen reader test: ${component} · ${reader.name}`,
    component,
    reader: `${reader.name} (${reader.setup})`,
    steps: steps.map(([action, hear], i) => `- [ ] ${i + 1}. ${action} → ${hear}`).join('\n'),
  });
  return `${REPO}/issues/new?${query}`;
}

/** What med.o provides: the component's accessibility notes as a check list. */
export function A11yNotes({ entry }: { entry: ManifestComponent }) {
  const notes = entry.a11y.notes ?? [];
  if (!notes.length) return null;
  return (
    <List type="check" size="md">
      {notes.map((note) => (
        <ListItem key={note}>
          <RichText text={note} />
        </ListItem>
      ))}
    </List>
  );
}

export function KeyboardTable({ entry }: { entry: ManifestComponent }) {
  const keys = entry.a11y.keyboard ?? [];
  if (!keys.length) return <p className="medo-text-body-md">{entry.name} has no keys of its own beyond Tab.</p>;
  return (
    <StaticTable variant="content" caption={`${entry.name} keyboard`} captionHidden>
      <thead>
        <tr>
          <th scope="col">Key</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody>
        {keys.map(([key, action]) => (
          <tr key={key}>
            <td>{key}</td>
            <td className="medo-text-secondary">
              <RichText text={action} />
            </td>
          </tr>
        ))}
      </tbody>
    </StaticTable>
  );
}

/** The automated check and one row per screen reader: result, versions and date, and a link to report a result. */
export function TestingStatus({ entry }: { entry: ManifestComponent }) {
  const test = entry.a11y.screenReader;
  const steps: Steps = test?.steps ?? [];
  return (
    <StaticTable variant="content" caption={`${entry.name} testing status`} captionHidden>
      <thead>
        <tr>
          <th scope="col">Test</th>
          <th scope="col">Result</th>
          <th scope="col">
            <span className="medo-visually-hidden">Report</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <span className="medo-text-label-md-strong">Automated</span>
            <br />
            <span className="medo-text-secondary">axe</span>
          </td>
          <td>
            <Badge tone="success" size="sm">
              Passed
            </Badge>
            <p className="medo-text-secondary">WCAG 2.2 A + AA in the Storybook tests – a violation fails the build.</p>
          </td>
          <td />
        </tr>
        {READERS.map((reader) => {
          const result = test?.tested?.find((t) => t.reader === reader.id);
          return (
            <tr key={reader.id}>
              <td>
                <span className="medo-text-label-md-strong">{reader.name}</span>
                <br />
                <span className="medo-text-secondary">{reader.setup}</span>
              </td>
              <td>
                {result ? (
                  <>
                    <Badge tone={result.result === 'passed' ? 'success' : 'warning'} size="sm">
                      {result.result === 'passed' ? 'Passed' : 'Issues'}
                    </Badge>
                    <p className="medo-text-secondary">
                      Tested with {result.versions} on {DATE.format(new Date(`${result.date}T12:00:00Z`))}
                      {result.issue ? ` · #${result.issue}` : ''}
                    </p>
                  </>
                ) : (
                  <Badge tone="neutral" size="sm">
                    Not tested
                  </Badge>
                )}
              </td>
              <td>
                {steps.length > 0 && (
                  <Link href={reportUrl(entry.name, reader, steps)} variant="standalone" size="sm" external target="_blank">
                    Report a result<span className="medo-visually-hidden"> for {reader.name}</span>
                  </Link>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </StaticTable>
  );
}

/** How to test with a screen reader: the manifest's steps through the Playground, and where to report. */
export function ScreenReaderSteps({ entry }: { entry: ManifestComponent }) {
  const steps: Steps = entry.a11y.screenReader?.steps ?? [];
  if (!steps.length) return null;
  return (
    <div className="medo-stack medo-gap-content">
      <h3 className="medo-text-heading-sm">How to test with a screen reader</h3>
      <p className="medo-text-body-md">
        The same steps with NVDA, VoiceOver and TalkBack: what to do and what you must hear – the words may differ, the
        meaning not. Listen only, don’t look at the screen.
      </p>
      <StaticTable variant="content" caption={`${entry.name} screen reader steps`} captionHidden>
        <thead>
          <tr>
            <th scope="col">Do</th>
            <th scope="col">You hear</th>
          </tr>
        </thead>
        <tbody>
          {steps.map(([action, hear]) => (
            <tr key={action}>
              <td>
                <RichText text={action} />
              </td>
              <td className="medo-text-secondary">
                <RichText text={hear} />
              </td>
            </tr>
          ))}
        </tbody>
      </StaticTable>
      <p className="medo-text-body-md">
        Done? Choose Report a result for the screen reader in the table above: a GitHub issue opens with component,
        screen reader and steps filled in. Keys, gestures and setup are in the guide.
      </p>
      <Link href={storybookDocsUrl(GUIDE_ID)} variant="standalone" size="sm" external target="_blank">
        Screen reader testing guide
      </Link>
    </div>
  );
}
