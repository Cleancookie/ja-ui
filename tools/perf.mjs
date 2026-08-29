/**
 * Performance gate for the data table: a million rows by a thousand columns,
 * driven in a real browser and measured, not eyeballed.
 *
 *   npm run build && npm run perf
 *
 * The budgets below are deliberately loose enough to survive a slow CI box and
 * tight enough to catch the things that actually break a virtualised grid:
 * rendering more DOM than the window needs, re-rendering on every scroll event
 * rather than once a frame, and measuring text by touching real cells.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { chromium } from 'playwright';

const CSS = readFileSync('dist/ja-ui.css', 'utf8');
const JS = readFileSync('dist/ja-ui.iife.js', 'utf8');

const ROWS = 1_000_000;
const COLUMNS = 1_000;

/** Budgets. Wall-clock ones are generous; the DOM ones are the real gate. */
const BUDGET = {
  mountMs: 400,
  nodes: 2_000,
  // requestAnimationFrame is vsync-paced at ~16.7ms even when the frame does no
  // work, so p95 is a "did we drop frames" check, not a cost-of-render one.
  // The worst frame is where a grid that re-lays-out on every scroll shows up.
  scrollFrameMs: 20,
  worstScrollFrameMs: 50,
  autoSizeAllMs: 250,
  scrollRenders: 60,
};

function findChromium() {
  if (process.env.PLAYWRIGHT_CHROMIUM_PATH) return process.env.PLAYWRIGHT_CHROMIUM_PATH;
  const cache = join(homedir(), '.cache', 'ms-playwright');
  if (!existsSync(cache)) return undefined;
  const build = readdirSync(cache).filter((d) => d.startsWith('chromium-')).sort().pop();
  if (!build) return undefined;
  for (const c of ['chrome-linux64/chrome', 'chrome-linux/chrome']) {
    const p = join(cache, build, c);
    if (existsSync(p)) return p;
  }
  return undefined;
}

const PAGE = `<!doctype html><html lang="en"><head><meta charset="utf-8" />
<style>${CSS}</style>
<style>#grid { block-size: 600px; }</style></head><body>
<div id="grid"></div>
<script>${JS}</script></body></html>`;

let failures = 0;
const report = (name, value, budget, unit) => {
  const ok = value <= budget;
  if (!ok) failures += 1;
  const shown = typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(1) : value;
  console.log(`  ${ok ? '✓' : '✗'} ${name.padEnd(42)} ${String(shown).padStart(8)}${unit} (budget ${budget}${unit})`);
};

const browser = await chromium.launch({ executablePath: findChromium() });
const page = await browser.newPage({ viewport: { width: 1400, height: 800 } });
page.on('pageerror', (error) => {
  console.error(`  ✗ page error: ${error.message}`);
  failures += 1;
});
await page.setContent(PAGE);

console.log(`\n  ${ROWS.toLocaleString()} rows × ${COLUMNS.toLocaleString()} columns\n`);

// Mount ---------------------------------------------------------------------
const mount = await page.evaluate(
  ({ rows, columns }) => {
    const started = performance.now();
    window.grid = new window.JaUI.DataTable('#grid', {
      rowCount: rows,
      columnCount: columns,
      getColumnLabel: (i) => `Field ${i + 1}`,
      getCell: (row, column) =>
        column === 4 && row % 1000 === 0
          ? '{"kind":"blob","payload":"' + 'x'.repeat(400) + '"}'
          : `R${row + 1}C${column + 1}`,
    });
    return performance.now() - started;
  },
  { rows: ROWS, columns: COLUMNS },
);
await page.waitForTimeout(200);
report('mount', mount, BUDGET.mountMs, 'ms');

const nodes = await page.evaluate(() => document.querySelectorAll('#grid *').length);
report('DOM nodes for the whole grid', nodes, BUDGET.nodes, '');

// Scroll --------------------------------------------------------------------
// Both axes at once, which is where a grid that only virtualises rows falls over.
const scroll = await page.evaluate(async () => {
  const viewport = document.querySelector('#grid .datatable-viewport');
  const frames = [];
  let renders = 0;
  const observer = new MutationObserver(() => {
    renders += 1;
  });
  observer.observe(viewport, { childList: true, subtree: true, attributes: true });

  let last = performance.now();
  for (let i = 0; i < 60; i += 1) {
    viewport.scrollTop += 617;
    viewport.scrollLeft += 233;
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const now = performance.now();
    frames.push(now - last);
    last = now;
  }
  observer.disconnect();
  frames.sort((a, b) => a - b);
  return { p95: frames[Math.floor(frames.length * 0.95)], worst: frames[frames.length - 1], renders };
});
report('scroll frame time (p95)', scroll.p95, BUDGET.scrollFrameMs, 'ms');
report('scroll frame time (worst)', scroll.worst, BUDGET.worstScrollFrameMs, 'ms');
report('DOM mutation bursts over 60 frames', scroll.renders, BUDGET.scrollRenders, '');

const stillThere = await page.evaluate(
  () => document.querySelectorAll('#grid .datatable-cell:not([hidden])').length > 0,
);
if (!stillThere) {
  console.log('  ✗ grid stopped rendering cells after deep scrolling');
  failures += 1;
} else {
  console.log('  ✓ grid still renders cells after deep scrolling');
}

// Auto-size every column ----------------------------------------------------
const autoSize = await page.evaluate(async () => {
  document.querySelector('#grid .datatable-corner').click();
  const started = performance.now();
  document
    .querySelector('#grid .datatable-corner .datatable-resize-handle')
    .dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
  return performance.now() - started;
});
report('auto-size all 1,000 columns', autoSize, BUDGET.autoSizeAllMs, 'ms');

await browser.close();

console.log(
  failures === 0
    ? '\n  within budget\n'
    : `\n  ${failures} measurement${failures === 1 ? '' : 's'} over budget\n`,
);
process.exit(failures === 0 ? 0 : 1);
