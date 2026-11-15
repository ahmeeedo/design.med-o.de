/**
 * Home, set "App" (Figma 37:2288): eight cards of everyday app screens – team, sign-in, notifications, documents,
 * settings, booking, activity and today's tasks –, built only from @med-o/ui. The bodies are exported on their own,
 * because the Showcase highlights reuse Sign in, Settings and Team (Figma "Home/Example · …").
 */
'use client';

import {
  Avatar,
  Button,
  Checkbox,
  DatePicker,
  FileItem,
  Link,
  ListRow,
  ListView,
  Option,
  Select,
  Stack,
  Switch,
  Tag,
  TagGroup,
  TextField,
  parseDate,
} from '@med-o/ui';
import { Globe, Moon, Sun, SunMoon } from 'lucide-react';
import { ExampleWall, type ExampleCard } from './example-wall';
import styles from './examples.module.css';

const noop = () => {};

export function SignInExample() {
  return (
    <Stack gap="content">
      <TextField label="Email" type="email" placeholder="name@example.com" />
      <TextField label="Password" type="password" defaultValue="correct horse" />
      <Button className={styles.full}>Sign in</Button>
      <Link href="#" variant="inline">
        Forgot password?
      </Link>
    </Stack>
  );
}

export function TeamExample() {
  return (
    <Stack gap="content">
      <Stack direction="horizontal" gap="inline">
        <TextField aria-label="Email address" placeholder="Email address" type="email" className={styles.full} />
        <Button variant="secondary">Invite</Button>
      </Stack>
      <ListView aria-label="Team members" variant="plain">
        <ListRow id="lea" title="Lea Meyer" description="lea.meyer@example.com" leading={<Avatar name="Lea Meyer" decorative />} meta="Admin" />
        <ListRow id="sam" title="Sam Klein" description="sam.klein@example.com" leading={<Avatar name="Sam Klein" decorative />} meta="Editor" />
        <ListRow id="jonas" title="Jonas Becker" description="jonas.becker@example.com" leading={<Avatar name="Jonas Becker" decorative />} meta="Viewer" />
      </ListView>
    </Stack>
  );
}

export function SettingsExample() {
  return (
    <Stack gap="content">
      <Select label="Theme" defaultValue="system" leadingIcon={<SunMoon />}>
        <Option id="system" icon={<SunMoon />}>
          System
        </Option>
        <Option id="light" icon={<Sun />}>
          Light
        </Option>
        <Option id="dark" icon={<Moon />}>
          Dark
        </Option>
      </Select>
      <Select label="Language" defaultValue="en" leadingIcon={<Globe />}>
        <Option id="en">English</Option>
        <Option id="de">German</Option>
      </Select>
      <Switch labelPosition="start">Reduce motion</Switch>
    </Stack>
  );
}

function NotificationsExample() {
  return (
    <Stack gap="content">
      <Switch labelPosition="start" description="When someone replies to you." defaultSelected>
        Comments
      </Switch>
      <Switch labelPosition="start" description="When someone mentions you." defaultSelected>
        Mentions
      </Switch>
      <Switch labelPosition="start" description="Every Monday at 9 am.">
        Weekly summary
      </Switch>
    </Stack>
  );
}

const MB = 1_000_000;

function DocumentsExample() {
  return (
    <Stack gap="inline">
      <FileItem file={{ id: 'lab', name: 'Lab report.pdf', size: 2.4 * MB, type: 'application/pdf', status: 'done' }} onRemove={noop} />
      <FileItem
        file={{ id: 'referral', name: 'Referral letter.pdf', size: 2.4 * MB, type: 'application/pdf', status: 'uploading', loaded: 1.6 * MB }}
        onCancel={noop}
        onRemove={noop}
      />
    </Stack>
  );
}

function BookingExample() {
  return (
    <Stack gap="content">
      <DatePicker aria-label="Date" defaultValue={parseDate('2026-11-24')} />
      <TagGroup aria-label="Time" selectionMode="single" defaultSelectedKeys={['10:30']}>
        <Tag id="9:00">9:00</Tag>
        <Tag id="10:30">10:30</Tag>
        <Tag id="13:00">13:00</Tag>
        <Tag id="15:30">15:30</Tag>
      </TagGroup>
      <Button className={styles.full}>Book appointment</Button>
    </Stack>
  );
}

function ActivityExample() {
  return (
    <ListView aria-label="Recent activity" variant="plain">
      <ListRow id="mia" title="Mia Wagner" description="Approved the color update" leading={<Avatar name="Mia Wagner" decorative />} meta="9:41 am" />
      <ListRow id="noah" title="Noah Schulz" description="Commented on Button" leading={<Avatar name="Noah Schulz" decorative />} meta="Yesterday" />
      <ListRow id="emma" title="Emma Fischer" description="Published version 1.4" leading={<Avatar name="Emma Fischer" decorative />} meta="Mon" />
    </ListView>
  );
}

function TodayExample() {
  return (
    <Stack gap="inline">
      <Checkbox defaultSelected>Review the design tokens</Checkbox>
      <Checkbox defaultSelected>Write release notes</Checkbox>
      <Checkbox>Test with a screen reader</Checkbox>
      <Checkbox>Plan the next sprint</Checkbox>
    </Stack>
  );
}

const TEAM: ExampleCard = { title: 'Your team', subtitle: 'Invite people and manage roles.', body: <TeamExample /> };
const SIGN_IN: ExampleCard = { title: 'Sign in', subtitle: 'Welcome back.', body: <SignInExample /> };
const NOTIFICATIONS: ExampleCard = { title: 'Notifications', subtitle: 'Choose what you hear about.', body: <NotificationsExample /> };
const DOCUMENTS: ExampleCard = { title: 'Documents', subtitle: 'Files shared with your team.', body: <DocumentsExample /> };
const SETTINGS: ExampleCard = { title: 'Settings', subtitle: 'Appearance and language.', body: <SettingsExample /> };
const BOOKING: ExampleCard = { title: 'Book an appointment', subtitle: 'Pick a date and a time.', body: <BookingExample /> };
const ACTIVITY: ExampleCard = { title: 'Recent activity', subtitle: 'What happened this week.', body: <ActivityExample /> };
const TODAY: ExampleCard = { title: 'Today', subtitle: '4 tasks, 2 done.', body: <TodayExample /> };

export function HomeApp() {
  return (
    <ExampleWall
      label="App examples"
      columns={[
        [TEAM, DOCUMENTS, ACTIVITY],
        [SIGN_IN, SETTINGS, TODAY],
        [NOTIFICATIONS, BOOKING],
      ]}
      row={[SIGN_IN, TEAM, SETTINGS]}
    />
  );
}
