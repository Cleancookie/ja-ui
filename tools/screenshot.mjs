/**
 * Capture the README imagery: component shots straight out of the built
 * Storybook (so the docs can never drift from the stories) and full-page shots
 * of the example templates.
 *
 *   npm run build && npm run build-storybook && npm run shots
 *
 * Playwright is a devDependency; the Chromium it drives is whatever is already
 * cached on the machine (override with PLAYWRIGHT_CHROMIUM_PATH).
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { homedir } from 'node:os';
import { chromium } from 'playwright';

const ROOT = 'storybook-static';
const OUT = 'site/images';
const PORT = 6007;

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
};

/**
 * Only regenerate the shots whose name contains one of the arguments:
 *   node tools/screenshot.mjs command-palette
 */
const FILTERS = process.argv.slice(2);
const wanted = (name) => !FILTERS.length || FILTERS.some((f) => name.includes(f));

/**
 * Component shots, taken from the built stories, keyed by the story ids in
 * `storybook-static/index.json`. `viewport` shoots the whole viewport instead
 * of the story root — for the overlays, which deliberately escape it — and
 * `prepare` drives the story before the shutter for anything that is not
 * already on screen.
 */
const COMPONENTS = [
  { id: 'elements-buttons--colour', name: 'buttons-solid', width: 1040 },
  { id: 'elements-buttons--treatment', name: 'buttons-treatment', width: 640, height: 1000 },
  { id: 'elements-feedback--badge', name: 'badges', width: 800 },
  { id: 'elements-forms--progress', name: 'progress', width: 580 },
  { id: 'elements-forms--text-controls', name: 'forms', width: 600 },
  { id: 'elements-forms--choice-controls', name: 'checks', width: 600 },
  { id: 'elements-table--variants', name: 'table', width: 860, height: 1100 },
  { id: 'elements-navigation--tabs', name: 'tabs', width: 760 },
  { id: 'elements-content--interactive', name: 'cards', width: 960 },
  { id: 'foundations-tokens--colour', name: 'tokens-colours', width: 900 },
  {
    id: 'components-command-palette--open',
    name: 'command-palette',
    width: 900,
    height: 560,
    viewport: true,
  },
  {
    id: 'elements-feedback--toast',
    name: 'toasts',
    width: 620,
    height: 460,
    viewport: true,
    // The stack is a top-layer popover pinned to the bottom-right corner, and it
    // does not exist until something has been toasted. Fire three, then shoot
    // well inside the five-second dismiss timer.
    prepare: async (page) => {
      for (const variant of ['success', 'danger', 'info']) {
        await page.click(`[data-variant="${variant}"]`);
        await page.waitForTimeout(120);
      }
    },
  },
];

/** Full-page shots of the standalone templates. */
const TEMPLATES = [
  ['dashboard.html', 'template-dashboard', 1440, 1000],
  ['cms.html', 'template-cms', 1440, 900],
  ['marketing.html', 'template-marketing', 1440, 1000],
  ['pricing.html', 'template-pricing', 1440, 1000],
  ['shop.html', 'template-shop', 1440, 1000],
  ['signin.html', 'template-signin', 1200, 900],
];

function serve() {
  const server = createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    let path = join(ROOT, normalize(url).replace(/^(\.\.[/\\])+/, ''));
    if (existsSync(path) && statSync(path).isDirectory()) path = join(path, 'index.html');
    if (!existsSync(path)) {
      res.writeHead(404).end('not found');
      return;
    }
    res.writeHead(200, { 'content-type': MIME[extname(path)] ?? 'application/octet-stream' });
    createReadStream(path).pipe(res);
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

/** Find a cached Chromium if Playwright's own download is missing. */
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

/**
 * Shoot the story root plus a margin. Decoration deliberately escapes its box
 * (icon discs that straddle a card border, corner stickers, hard shadows), and
 * an element-clipped screenshot would slice it off.
 */
async function shoot(page, path, margin = 28) {
  const box = await page.locator('#storybook-root').boundingBox();
  const viewport = page.viewportSize();
  const clip = {
    x: Math.max(0, box.x - margin),
    y: Math.max(0, box.y - margin),
    width: Math.min(viewport.width - Math.max(0, box.x - margin), box.width + margin * 2),
    height: Math.min(viewport.height - Math.max(0, box.y - margin), box.height + margin * 2),
  };
  // A story taller than its viewport would be silently guillotined by the clip,
  // and a half a table in the README looks like a rendering bug.
  if (box.height + margin * 2 > viewport.height) {
    console.warn(
      `  ! ${path} clipped: story is ${Math.ceil(box.height)}px in a ${viewport.height}px viewport`
    );
  }
  await page.screenshot({ path, clip, animations: 'disabled' });
}

const storyUrl = (id, globals) =>
  `http://localhost:${PORT}/iframe.html?id=${id}&viewMode=story` +
  (globals ? `&globals=${encodeURIComponent(globals)}` : '');

async function main() {
  mkdirSync(OUT, { recursive: true });
  const server = await serve();
  const browser = await chromium.launch({ executablePath: findChromium() });

  // Component shots: 2× for crisp README images.
  const ctx = await browser.newContext({ deviceScaleFactor: 2, reducedMotion: 'reduce' });
  const page = await ctx.newPage();

  for (const shot of COMPONENTS) {
    if (!wanted(shot.name)) continue;
    await page.setViewportSize({ width: shot.width, height: shot.height ?? 900 });
    await page.goto(storyUrl(shot.id), { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      document.body.style.padding = '24px';
      document.documentElement.style.background = 'var(--ja-body-bg)';
    });
    await page.waitForTimeout(250);
    await shot.prepare?.(page);
    const path = join(OUT, `${shot.name}.png`);
    if (shot.viewport) await page.screenshot({ path, animations: 'disabled' });
    else await shoot(page, path);
    console.log(`  ${shot.name}.png`);
  }

  // A dark-mode and a brutal-skin shot, to show both off.
  for (const [id, name, width, globals] of [
    ['elements-content--interactive', 'cards-dark', 960, 'theme:dark'],
    ['elements-buttons--colour', 'buttons-brutal', 1040, 'skin:brutal'],
  ]) {
    if (!wanted(name)) continue;
    await page.setViewportSize({ width, height: 900 });
    await page.goto(storyUrl(id, globals), { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      document.body.style.padding = '24px';
    });
    await page.waitForTimeout(250);
    await shoot(page, join(OUT, `${name}.png`));
    console.log(`  ${name}.png`);
  }
  await ctx.close();

  // Template shots at 1× — they are large pages already.
  const wide = await browser.newContext({ deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const widePage = await wide.newPage();
  for (const [file, name, width, height] of TEMPLATES) {
    if (!wanted(name)) continue;
    await widePage.setViewportSize({ width, height });
    await widePage.goto(`http://localhost:${PORT}/examples/${file}`, {
      waitUntil: 'networkidle',
    });
    await widePage.waitForTimeout(400);
    await widePage.screenshot({
      path: join(OUT, `${name}.png`),
      fullPage: true,
      animations: 'disabled',
    });
    console.log(`  ${name}.png`);
  }
  await wide.close();

  await browser.close();
  server.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
