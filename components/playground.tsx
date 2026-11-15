/**
 * The Playground of a component page (Figma Component · Guidelines 106:3998): the live component from @med-o/ui on a
 * stage, and below it the controls the package manifest lists for it, each with a visible label. The control kind
 * decides the field: a choice of five or more options is a Select, a smaller choice a segmented Toggle button group,
 * an on/off value a Switch. The server (components/mdx/components.tsx) turns the manifest into these controls and
 * fails the build for a kind or a component this file does not render yet, so phase 2 extends it on purpose.
 * The state lives here only; nothing goes to the URL.
 */
'use client';

import { useId, useState, type ComponentType, type ReactNode } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { Button, FieldLabel, Option, Select, Switch, ToggleButton, ToggleButtonGroup } from '@med-o/ui';
import styles from './playground.module.css';

/** A control as the server prepares it from the manifest. */
export type PlaygroundControl =
  | { name: string; kind: 'choice'; options: string[]; default: string; mapping?: Record<string, string> }
  | { name: string; kind: 'boolean'; default: boolean };

/** The components the Playground can render, by manifest name. Add one here and in PLAYGROUND_COMPONENTS. */
const COMPONENTS: Record<string, ComponentType<Record<string, unknown>>> = {
  Button: Button as ComponentType<Record<string, unknown>>,
};

/** What a mapped option passes to the prop it maps to (icon: start → startIcon). */
const MAPPED: Record<string, ReactNode> = {
  startIcon: <Plus />,
  endIcon: <ArrowRight />,
};

/** "isPending" → "Pending", "variant" → "Variant". */
const labelOf = (name: string) => {
  const words = name.replace(/^is(?=[A-Z])/, '').replace(/([A-Z])/g, ' $1').trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/** "ghost-danger" → "Ghost danger" in a Select; segmented options keep the prop value ("sm", "md"). */
const optionLabel = (option: string) => (option.charAt(0).toUpperCase() + option.slice(1)).replaceAll('-', ' ');

type Values = Record<string, string | boolean>;

function ChoiceField({ control, value, onChange }: { control: Extract<PlaygroundControl, { kind: 'choice' }>; value: string; onChange: (value: string) => void }) {
  const labelId = useId();
  if (control.options.length >= 5) {
    return (
      <div className={styles.select}>
        <Select label={labelOf(control.name)} selectedKey={value} onSelectionChange={(key) => key !== null && onChange(String(key))}>
          {control.options.map((option) => (
            <Option key={option} id={option}>
              {optionLabel(option)}
            </Option>
          ))}
        </Select>
      </div>
    );
  }
  return (
    <div className="medo-stack medo-gap-inline">
      {/* The library field label, so a segmented group is labeled like the Select next to it. */}
      <span id={labelId}>
        <FieldLabel>{labelOf(control.name)}</FieldLabel>
      </span>
      <ToggleButtonGroup
        aria-labelledby={labelId}
        variant="segmented"
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={new Set([value])}
        onSelectionChange={(keys) => {
          const [key] = [...keys];
          if (key !== undefined) onChange(String(key));
        }}
      >
        {control.options.map((option) => (
          <ToggleButton key={option} id={option}>
            {option}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </div>
  );
}

export function Playground({ component, label, controls }: { component: string; label: string; controls: PlaygroundControl[] }) {
  const [values, setValues] = useState<Values>(() => Object.fromEntries(controls.map((c) => [c.name, c.default])));
  const Component = COMPONENTS[component];
  const set = (name: string, value: string | boolean) => setValues((current) => ({ ...current, [name]: value }));

  const props: Record<string, unknown> = {};
  for (const control of controls) {
    const value = values[control.name];
    if (control.kind === 'choice' && control.mapping) {
      const prop = typeof value === 'string' ? control.mapping[value] : undefined;
      if (prop) props[prop] = MAPPED[prop] ?? value;
    } else {
      props[control.name] = value;
    }
  }

  return (
    <div className={styles.playground}>
      <div className={styles.stage}>
        <Component {...props}>{label}</Component>
      </div>
      <div className={styles.controls}>
        {controls.map((control) =>
          control.kind === 'boolean' ? (
            <Switch key={control.name} isSelected={values[control.name] === true} onChange={(on) => set(control.name, on)}>
              {labelOf(control.name)}
            </Switch>
          ) : (
            <ChoiceField key={control.name} control={control} value={String(values[control.name])} onChange={(v) => set(control.name, v)} />
          ),
        )}
      </div>
    </div>
  );
}
