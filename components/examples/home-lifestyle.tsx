/**
 * Home, set "Lifestyle" (Figma 55:5594): a music player, the queue, sound settings and saved albums, with real
 * songs and albums (titles, artists and lengths as released). The covers are files in public/examples/covers/, one
 * per album, named artist-album. Loaded only when its tab is chosen. The player is exported for the Showcase highlights.
 */
'use client';

import { Avatar, IconButton, Image, ListRow, ListView, Option, Select, Slider, Stack, Switch } from '@med-o/ui';
import { Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { ExampleWall, type ExampleCard } from './example-wall';
import styles from './examples.module.css';
import own from './home-lifestyle.module.css';

const cover = (album: string) => `/examples/covers/${album}.jpg`;
const PERCENT = { style: 'percent' } as const;

/** Up next, with each song's album for its cover. */
const QUEUE_SONGS = [
  { id: 'snowchild', title: 'Snowchild', artist: 'The Weeknd', album: 'theweeknd-after-hours', length: '4:07' },
  { id: 'less', title: 'The Less I Know the Better', artist: 'Tame Impala', album: 'tame-impala-currents', length: '3:36' },
  { id: 'wnba', title: 'WNBA', artist: 'Drake', album: 'drake-habibti', length: '2:58' },
  { id: 'pleasure', title: "Pleasure's Mine", artist: 'Don Toliver', album: 'don-toliver-octane', length: '2:57' },
];

const ALBUMS = [
  { title: 'Blonde', artist: 'Frank Ocean', cover: 'frank-ocean-blonde', length: '17 songs · 60:08' },
  { title: 'Astroworld', artist: 'Travis Scott', cover: 'travis-scott-astroworld', length: '17 songs · 58:33' },
  { title: 'Dangerous Summer', artist: 'Yeat', cover: 'yeat-dangerous-summer', length: '11 songs · 33:47' },
  { title: 'Honestly, Nevermind', artist: 'Drake', cover: 'drake-honestly-nevermind', length: '14 songs · 52:32' },
];

export function PlayerExample() {
  return (
    <Stack gap="content">
      <Stack direction="horizontal" gap="content" align="center">
        <div className={own.cover}>
          <Image src={cover('drake-her-loss')} alt="" ratio="1:1" radius="md" />
        </div>
        <Stack gap="inline">
          <p className="medo-text-heading-sm">Hours in Silence</p>
          <p className="medo-text-body-sm medo-text-secondary">Drake &amp; 21 Savage</p>
        </Stack>
      </Stack>
      <Stack gap="inline">
        <Slider aria-label="Playback position" defaultValue={40} showValue={false} />
        <div className={styles.between}>
          <p className="medo-text-caption medo-text-secondary">2:40</p>
          <p className="medo-text-caption medo-text-secondary">6:39</p>
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
  return (
    <ListView aria-label="Up next" variant="plain">
      {QUEUE_SONGS.map((song) => (
        <ListRow
          key={song.id}
          id={song.id}
          title={song.title}
          description={song.artist}
          leading={<Avatar src={cover(song.album)} shape="square" size="lg" decorative />}
          meta={song.length}
        />
      ))}
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

function AlbumsExample() {
  return (
    <ul className={styles.tiles}>
      {ALBUMS.map((album) => (
        <Stack as="li" key={album.title} gap="inline">
          <Image src={cover(album.cover)} alt="" ratio="1:1" radius="md" />
          <div>
            <p className="medo-text-label-md-strong">{album.title}</p>
            <p className="medo-text-caption medo-text-secondary">{album.artist}</p>
            <p className="medo-text-caption medo-text-secondary">{album.length}</p>
          </div>
        </Stack>
      ))}
    </ul>
  );
}

const PLAYER: ExampleCard = { title: 'Now playing', subtitle: 'From “Her Loss”', body: <PlayerExample /> };
const QUEUE: ExampleCard = { title: 'Up next', subtitle: '4 songs · 13:38', body: <QueueExample /> };
const SOUND: ExampleCard = { title: 'Sound', subtitle: 'Output and levels', body: <SoundExample /> };
const ALBUMS_CARD: ExampleCard = { title: 'Saved albums', subtitle: 'In your library', body: <AlbumsExample /> };

export function HomeLifestyle() {
  return (
    <ExampleWall label="Lifestyle examples" columns={[[PLAYER], [QUEUE, SOUND], [ALBUMS_CARD]]} row={[PLAYER, QUEUE, SOUND]} />
  );
}
