/**
 * Light and Dark side by side (Figma 67:2257, mobile 79:2562): the same markup twice, once under data-theme="light"
 * and once under data-theme="dark"; the dark copy is cut at the split. The split moves with the pointer: press
 * anywhere on the picture and drag, or tap a spot – the handle on the divider shows where. The library Slider below
 * moves it too and is the control for keyboard and screen reader users; the handle and the picture are decorative.
 * Both copies are a picture of the components, not a form: they are inert and hidden from assistive technology.
 * Below 640 px the scene is the Settings card, as in the mobile design.
 */
'use client';

import { useState, type PointerEvent } from 'react';
import { Alert, Avatar, AvatarGroup, Badge, Button, Card, Checkbox, ProgressBar, Slider, Stack, Switch, TextField } from '@med-o/ui';
import { GripVertical } from 'lucide-react';
import { SettingsExample } from './home-app';
import examples from './examples.module.css';
import styles from './showcase-theme-compare.module.css';

const PERCENT = { style: 'percent' } as const;

function Scene() {
  return (
    <>
      <div className={styles.scene}>
        <div className={styles.signUp}>
          <Card title="Create an account" variant="elevated">
            <Stack gap="content">
              <TextField label="Email" type="email" placeholder="name@example.com" />
              <Checkbox defaultSelected>Send me product updates</Checkbox>
              <Button className={examples.full}>Create account</Button>
            </Stack>
          </Card>
        </div>
        <Stack gap="items" className={styles.side}>
          <div className={styles.panel}>
            <Stack gap="content">
              <Switch labelPosition="start" defaultSelected>
                Dark mode
              </Switch>
              <Switch labelPosition="start">Notifications</Switch>
            </Stack>
          </div>
          <div className={styles.panel}>
            <Stack gap="content">
              <ProgressBar label="Uploading report" value={72} showValue size="sm" />
              <AvatarGroup size="sm" max={4} aria-label="Shared with">
                {['Ada Dorn', 'Lea Meyer', 'Sam Klein', 'Jonas Becker', 'Mia Wagner', 'Noah Schulz', 'Emma Fischer'].map((name) => (
                  <Avatar key={name} name={name} />
                ))}
              </AvatarGroup>
            </Stack>
          </div>
        </Stack>
        <div className={styles.alert}>
          <Alert tone="success" title="Changes saved" />
        </div>
      </div>
      <div className={styles.mobileScene}>
        <Card title="Settings" subtitle="Appearance and language." density="compact">
          <SettingsExample />
        </Card>
      </div>
    </>
  );
}

export function ShowcaseThemeCompare() {
  const [split, setSplit] = useState(0.5);
  const [dragging, setDragging] = useState(false);

  // The pointer sets the split directly: where it is, the dark copy starts.
  const splitAt = (e: PointerEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    setSplit(Math.min(1, Math.max(0, (e.clientX - box.left) / box.width)));
  };
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    splitAt(e);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging) splitAt(e);
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <Stack gap="content">
      <div
        className={styles.compare}
        data-dragging={dragging || undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div data-theme="light" className={styles.layer} inert aria-hidden="true">
          <Badge size="sm" className={styles.badge}>
            Light
          </Badge>
          <Scene />
        </div>
        <div
          data-theme="dark"
          className={`${styles.layer} ${styles.dark}`}
          style={{ clipPath: `inset(0 0 0 ${split * 100}%)` }}
          inert
          aria-hidden="true"
        >
          <Badge size="sm" className={`${styles.badge} ${styles.badgeEnd}`}>
            Dark
          </Badge>
          <Scene />
        </div>
        <div className={styles.handle} style={{ insetInlineStart: `${split * 100}%` }} aria-hidden="true">
          <GripVertical />
        </div>
      </div>
      <Slider
        label="Light on the left"
        value={split}
        onChange={(value) => setSplit(value as number)}
        minValue={0}
        maxValue={1}
        step={0.01}
        formatOptions={PERCENT}
        className={styles.slider}
      />
    </Stack>
  );
}
