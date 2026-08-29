/**
 * Record the README's interaction GIFs.
 *
 * Frames are captured one real state at a time — rest, hover, pressed — rather
 * than screen-recorded, because headless Chromium drops most transition frames
 * and because ja-ui's motion is deliberately stepped and mechanical anyway.
 * Each frame is a genuine screenshot of the real CSS state.
 *
 * GIFs are encoded in-process: the ffmpeg Playwright bundles has no GIF encoder.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { chromium } from 'playwright';
import gifenc from 'gifenc';
import { PNG } from 'pngjs';

const { GIFEncoder, quantize, applyPalette } = gifenc;

const OUT = 'site/images';
// Inlined rather than linked: setContent pages have no origin, so they cannot
// pull in file:// subresources.
const CSS = readFileSync('dist/ja-ui.css', 'utf8');

function findChromium() {
  if (process.env.PLAYWRIGHT_CHROMIUM_PATH) return process.env.PLAYWRIGHT_CHROMIUM_PATH;
  const cache = join(homedir(), '.cache', 'ms-playwright');
  if (!existsSync(cache)) return undefined;
  const build = readdirSync(cache)
    .filter((d) => d.startsWith('chromium-'))
    .sort()
    .pop();
  if (!build) return undefined;
  for (const candidate of ['chrome-linux64/chrome', 'chrome-linux/chrome']) {
    const path = join(cache, build, candidate);
    if (existsSync(path)) return path;
  }
  return undefined;
}

const document_ = (body, extra = '') => `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;700&display=swap" />
<style>
  ${CSS}
  body { display: grid; place-items: center; min-block-size: 100vh; background: var(--ja-body-bg); }
  ${extra}
</style></head><body>${body}</body></html>`;

/** One palette for the whole clip keeps flat brand colours from shimmering. */
function encodeGif(frames, path) {
  const gif = GIFEncoder();
  let palette = null;
  for (const { png: buffer, delay } of frames) {
    const png = PNG.sync.read(buffer);
    const rgba = new Uint8ClampedArray(png.data);
    palette ??= quantize(rgba, 96, { format: 'rgb565' });
    const index = applyPalette(rgba, palette, 'rgb565');
    gif.writeFrame(index, png.width, png.height, { palette, delay });
  }
  gif.finish();
  writeFileSync(path, Buffer.from(gif.bytes()));
}

const CLIPS = [
  {
    name: 'interaction-buttons',
    size: { width: 620, height: 200 },
    html: document_(`
      <div style="display:flex; gap:1.5rem">
        <button class="primary lg" id="a">Save changes</button>
        <button class="outline lg" id="b">Cancel</button>
      </div>
    `),
    steps: [
      { delay: 900 },
      { hover: '#a', delay: 700, label: 'lift' },
      { press: true, delay: 500, label: 'press' },
      { release: true, delay: 700 },
      { hover: '#b', delay: 700 },
      { press: true, delay: 500 },
      { release: true, delay: 700 },
      { hover: 'body', delay: 900 },
    ],
  },
  {
    name: 'interaction-cards',
    size: { width: 700, height: 280 },
    html: document_(`
      <div style="display:flex; gap:1.5rem">
        <article class="interactive" style="inline-size: 15rem" id="a">
          <h3>Deployments</h3>
          <p>Hover: the card lifts.</p>
        </article>
        <article class="interactive" style="inline-size: 15rem" id="b">
          <h3>Audit log</h3>
          <p>Click: it presses back down.</p>
        </article>
      </div>
    `),
    steps: [
      { delay: 900 },
      { hover: '#a', delay: 800 },
      { press: true, delay: 450 },
      { release: true, delay: 600 },
      { hover: '#b', delay: 800 },
      { press: true, delay: 450 },
      { release: true, delay: 600 },
      { hover: 'body', delay: 900 },
    ],
  },
  {
    name: 'interaction-theme',
    size: { width: 660, height: 340 },
    html: document_(`
      <div style="display:flex; flex-direction:column; gap:0.75rem; inline-size: 28rem">
        <div style="display:flex; gap:0.5rem; align-items:center">
          <button class="primary">Primary</button>
          <button class="pop soft">Soft</button>
          <span class="badge success">Live</span>
        </div>
        <article>
          <h3>One markup, four looks</h3>
          <p>Light and dark, in both skins.</p>
          <progress value="0.64"></progress>
        </article>
      </div>
    `),
    steps: [
      { theme: ['light', null], delay: 1400 },
      { theme: ['dark', null], delay: 1400 },
      { theme: ['light', 'brutal'], delay: 1400 },
      { theme: ['dark', 'brutal'], delay: 1400 },
    ],
  },
];

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: findChromium() });

  for (const clip of CLIPS) {
    const ctx = await browser.newContext({ viewport: clip.size, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.setContent(clip.html, { waitUntil: 'networkidle' });

    const frames = [];
    for (const step of clip.steps) {
      if (step.theme) {
        await page.evaluate(([theme, skin]) => {
          document.documentElement.dataset.theme = theme;
          if (skin) document.documentElement.dataset.style = skin;
          else delete document.documentElement.dataset.style;
        }, step.theme);
      }
      if (step.hover) await page.hover(step.hover);
      if (step.press) await page.mouse.down();
      if (step.release) await page.mouse.up();
      // Let the transition land before the shutter.
      await page.waitForTimeout(280);
      frames.push({ png: await page.screenshot(), delay: step.delay });
    }

    await ctx.close();
    encodeGif(frames, join(OUT, `${clip.name}.gif`));
    console.log(`  ${clip.name}.gif — ${frames.length} frames`);
  }

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
