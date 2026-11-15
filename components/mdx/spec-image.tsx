/**
 * Spec images in MDX: a Markdown image (![alt](/spec/<page>/<name>.svg)) renders as the library Image, at the width
 * and height of its SVG, read at build time, so the page does not jump. Only SVG exports from Figma under
 * public/spec/ are allowed, and the alt text must name the labeled parts; anything else fails the build. Shared by the
 * area maps that show spec images (patterns, components).
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { ComponentPropsWithoutRef } from 'react';
import { Image } from '@med-o/ui';

/** Images that pages may show: SVG exports from Figma under public/spec/. */
const SPEC_IMAGE = /^\/spec\/[\w-]+\/[\w-]+\.svg$/;

export async function SpecImage({ src, alt = '' }: ComponentPropsWithoutRef<'img'>) {
  if (typeof src !== 'string' || !SPEC_IMAGE.test(src)) throw new Error(`Image "${String(src)}": use an SVG under /spec/<page>/`);
  if (!alt.trim()) throw new Error(`Image "${src}" needs alt text that names its labeled parts`);
  const svg = await readFile(path.join(process.cwd(), 'public', src), 'utf8');
  const width = Number(/<svg[^>]*\swidth="(\d+)"/.exec(svg)?.[1]) || undefined;
  const height = Number(/<svg[^>]*\sheight="(\d+)"/.exec(svg)?.[1]) || undefined;
  return <Image src={src} alt={alt} width={width} height={height} ratio="original" fit="contain" radius="lg" />;
}
