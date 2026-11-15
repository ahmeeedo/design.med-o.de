/**
 * Home, set "Lifestyle" (Figma 55:5594): a music player, the queue, sound settings and playlists. Loaded only when
 * its tab is chosen. The player is exported for the Showcase highlights.
 */
'use client';

import { Avatar, IconButton, Image, ListRow, ListView, Option, Select, Slider, Stack, Switch } from '@med-o/ui';
import { Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { ExampleWall, type ExampleCard } from './example-wall';
import styles from './examples.module.css';
import own from './home-lifestyle.module.css';

const NIGHT = '/examples/landscape-night.jpg';
const DAY = '/examples/landscape-day.jpg';
const PERCENT = { style: 'percent' } as const;

export function PlayerExample() {
  return (
    <Stack gap="content">
      <Stack direction="horizontal" gap="content" align="center">
        <div className={own.cover}>
          <Image src={NIGHT} alt="" ratio="1:1" radius="md" />
        </div>
        <Stack gap="inline">
          <p className="medo-text-heading-sm">Golden Hour</p>
          <p className="medo-text-body-sm medo-text-secondary">Mara Lind</p>
        </Stack>
      </Stack>
      <Stack gap="inline">
        <Slider aria-label="Playback position" defaultValue={40} showValue={false} />
        <div className={styles.between}>
          <p className="medo-text-caption medo-text-secondary">1:24</p>
          <p className="medo-text-caption medo-text-secondary">3:42</p>
        </div>
      </Stack>
      <Stack direction="horizontal" gap="content" align="center" justify="center">
        <IconButton aria-label="Previous track" icon={<SkipBack />} />
        <IconButton aria-label="Pause" icon={<Pause />} variant="primary" size="lg" />
        <IconButton aria-label="Next track" icon={<SkipForward />} />
      </Stack>
    </Stack>
  );
}

function QueueExample() {
  const cover = <Avatar src={DAY} shape="square" size="lg" decorative />;
  return (
    <ListView aria-label="Up next" variant="plain">
      <ListRow id="golden" title="Golden Hour" description="Mara Lind" leading={cover} meta="3:42" />
      <ListRow id="night" title="Night Drive" description="The Lanterns" leading={cover} meta="4:05" />
      <ListRow id="boats" title="Paper Boats" description="June & Co." leading={cover} meta="2:58" />
      <ListRow id="morning" title="Slow Morning" description="Ana Ruiz" leading={cover} meta="3:21" />
    </ListView>
  );
}

function SoundExample() {
  return (
    <Stack gap="content">
      <Slider label="Volume" defaultValue={0.4} minValue={0} maxValue={1} step={0.01} formatOptions={PERCENT} />
      <Slider label="Bass" defaultValue={0.4} minValue={0} maxValue={1} step={0.01} formatOptions={PERCENT} />
      <Switch labelPosition="start" defaultSelected>
        Normalize volume
      </Switch>
      <Select label="Output" defaultValue="living" leadingIcon={<Volume2 />}>
        <Option id="living">Living room speaker</Option>
        <Option id="headphones">Headphones</Option>
        <Option id="device">This device</Option>
      </Select>
    </Stack>
  );
}

const PLAYLISTS = [
  { title: 'Focus', count: '24 songs' },
  { title: 'Weekend', count: '31 songs' },
  { title: 'Run', count: '18 songs' },
  { title: 'Calm', count: '40 songs' },
];

function PlaylistsExample() {
  return (
    <ul className={styles.tiles}>
      {PLAYLISTS.map((playlist) => (
        <Stack as="li" key={playlist.title} gap="inline">
          <Image src={NIGHT} alt="" ratio="1:1" radius="md" />
          <div>
            <p className="medo-text-label-md-strong">{playlist.title}</p>
            <p className="medo-text-caption medo-text-secondary">{playlist.count}</p>
          </div>
        </Stack>
      ))}
    </ul>
  );
}

const PLAYER: ExampleCard = { title: 'Now playing', subtitle: 'From “Focus”', body: <PlayerExample /> };
const QUEUE: ExampleCard = { title: 'Up next', subtitle: '4 songs · 13 min', body: <QueueExample /> };
const SOUND: ExampleCard = { title: 'Sound', subtitle: 'Output and levels', body: <SoundExample /> };
const PLAYLISTS_CARD: ExampleCard = { title: 'Your playlists', subtitle: 'Made for you', body: <PlaylistsExample /> };

export function HomeLifestyle() {
  return (
    <ExampleWall label="Lifestyle examples" columns={[[PLAYER], [QUEUE, SOUND], [PLAYLISTS_CARD]]} row={[PLAYER, QUEUE, SOUND]} />
  );
}
