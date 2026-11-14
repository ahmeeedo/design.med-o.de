/**
 * Builds public/og.png, the Open Graph image every page shares: the white logo (public/logo-white.svg) centered on
 * the brand surface. The color is read from the token surface/brand-bold in @med-o/design-tokens, the surface the
 * system pairs with text/on-brand (white), so the image follows the tokens instead of a copied value.
 * The PNG is committed, so the build never depends on sharp. Run it again after a logo or brand color change:
 *   node scripts/og-image.mjs
 * Size: 1200×630, the Open Graph and Twitter large image format; the logo spans half the width.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const WIDTH = 1200;
const HEIGHT = 630;
const LOGO_WIDTH = WIDTH / 2;
const TOKEN = 'surface/brand-bold';

const require = createRequire(import.meta.url);
const tokens = require('@med-o/design-tokens/docs/tokens.light.json');
const background = tokens.find((token) => token.name === TOKEN)?.value;
if (!background) throw new Error(`Token ${TOKEN} not found in @med-o/design-tokens.`);

const logo = await sharp(readFileSync(`${ROOT}public/logo-white.svg`))
  .resize({ width: LOGO_WIDTH })
  .png()
  .toBuffer();

await sharp({ create: { width: WIDTH, height: HEIGHT, channels: 3, background } })
  .composite([{ input: logo, gravity: 'center' }])
  .png({ compressionLevel: 9 })
  .toFile(`${ROOT}public/og.png`);

console.log(`public/og.png: ${WIDTH}×${HEIGHT}, logo ${LOGO_WIDTH} px wide on ${TOKEN} (${background}).`);
