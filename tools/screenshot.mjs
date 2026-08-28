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
const OUT = 'docs/images';
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
 * Component shots, taken from the built stories. The optional fourth field
 * takes the whole viewport instead of the story root — for overlays, which
 * deliberately escape it.
 */
const COMPONENTS = [
  ['components-button--solid', 'buttons-solid', 1040],
  ['components-button--outline', 'buttons-outline', 1040],
  ['components-button--soft', 'buttons-soft', 1040],
  ['components-button--with-icons', 'buttons-icons', 900],
  ['components-button--groups', 'button-groups', 700],
  ['components-badge--shapes', 'badges', 800],
  ['components-alert--colours', 'alerts', 760],
  ['components-alert--with-heading-and-icon', 'alert-rich', 760],
  ['components-card--interactive', 'cards', 960],
  ['components-card--variations', 'card-variations', 960],
  ['components-table--in-a-card', 'table', 860],
  ['components-list-group--actionable', 'list-group', 480],
  ['components-accordion--basic', 'accordion', 640],
  ['components-navigation--tabs', 'tabs', 760],
  ['components-navigation--dropdown', 'dropdown', 520],
  ['components-navigation--pagination', 'pagination', 620],
  ['components-feedback--progress', 'progress', 620],
  ['components-feedback--spinners', 'spinners', 620],
  ['components-overlays--static-toasts', 'toasts', 460],
  ['components-command-palette--open', 'command-palette', 900, true],
  ['forms-controls--text-inputs', 'forms', 560],
  ['forms-controls--checks-and-radios', 'checks', 560],
  ['forms-controls--full-form', 'form-card', 700],
  ['foundations-design-tokens--colours', 'tokens-colours', 900],
  ['foundations-design-tokens--typography', 'typography', 800],
  ['foundations-design-tokens--elevation', 'elevation', 900],
  ['foundations-design-tokens--decoration', 'decoration', 820],
  ['foundations-design-tokens--stats', 'stats', 900],
  ['layout-grid--columns', 'grid', 860],
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

  for (const [id, name, width, fullViewport] of COMPONENTS) {
    if (!wanted(name)) continue;
    await page.setViewportSize({ width, height: fullViewport ? 560 : 900 });
    await page.goto(storyUrl(id), { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      document.body.style.padding = '24px';
      document.documentElement.style.background = 'var(--ja-body-bg)';
    });
    await page.waitForTimeout(250);
    if (fullViewport) await page.screenshot({ path: join(OUT, `${name}.png`), animations: 'disabled' });
    else await shoot(page, join(OUT, `${name}.png`));
    console.log(`  ${name}.png`);
  }

  // A dark-mode and a brutal-skin shot, to show both off.
  for (const [id, name, width, globals] of [
    ['components-card--interactive', 'cards-dark', 960, 'theme:dark'],
    ['foundations-design-tokens--colours', 'tokens-dark', 900, 'theme:dark'],
    ['components-button--solid', 'buttons-brutal', 1040, 'skin:brutal'],
    ['components-card--interactive', 'cards-brutal', 960, 'skin:brutal'],
    ['forms-controls--text-inputs', 'forms-brutal', 560, 'skin:brutal'],
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
