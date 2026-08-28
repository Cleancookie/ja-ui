/**
 * Smoke test: drive every interactive component in a real browser and assert
 * the visible outcome. Not a unit-test suite — a "does the JS actually work"
 * gate to run before publishing.
 *
 *   npm run build && npm run smoke
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { chromium } from 'playwright';

const CSS = readFileSync('dist/ja-ui.css', 'utf8');
const JS = readFileSync('dist/ja-ui.iife.js', 'utf8');

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
<style>${CSS}</style></head><body>
  <button class="btn" id="modal-open" data-ja-toggle="modal" data-ja-target="#m">Open</button>
  <div class="modal fade" id="m" tabindex="-1">
    <div class="modal-dialog"><div class="modal-content">
      <div class="modal-header"><h5 class="modal-title">Title</h5>
      <button class="btn-close" data-ja-dismiss="modal"></button></div>
      <div class="modal-body"><input id="modal-input" class="form-control" /></div>
    </div></div>
  </div>

  <div class="dropdown">
    <button class="btn dropdown-toggle" id="dd" data-ja-toggle="dropdown">Menu</button>
    <ul class="dropdown-menu"><li><a class="dropdown-item" href="#" id="dd-item">One</a></li>
    <li><a class="dropdown-item" href="#">Two</a></li></ul>
  </div>

  <button class="btn" id="col-toggle" data-ja-toggle="collapse" data-ja-target="#col">Toggle</button>
  <div class="collapse" id="col"><div class="p-4">Region</div></div>

  <div class="alert alert-info fade show" id="al">Dismiss me
    <button class="btn-close" data-ja-dismiss="alert"></button></div>

  <ul class="nav nav-tabs">
    <li class="nav-item"><button class="nav-link active" data-ja-toggle="tab" data-ja-target="#p1">1</button></li>
    <li class="nav-item"><button class="nav-link" id="tab2" data-ja-toggle="tab" data-ja-target="#p2">2</button></li>
  </ul>
  <div class="tab-content">
    <div class="tab-pane fade active show" id="p1">Pane one</div>
    <div class="tab-pane fade" id="p2">Pane two</div>
  </div>

  <button class="btn" id="oc-open" data-ja-toggle="offcanvas" data-ja-target="#oc">Drawer</button>
  <div class="offcanvas offcanvas-end" id="oc" tabindex="-1">
    <div class="offcanvas-body"><button class="btn" data-ja-dismiss="offcanvas">Close</button></div>
  </div>

  <div class="toast-container bottom-0 end-0"><div class="toast" id="t">
    <div class="toast-body">Hello</div></div></div>

  <button class="btn" id="tog" data-ja-toggle="button" aria-pressed="false">Toggle</button>
<script>${JS}</script></body></html>`;

const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? '  ✓' : '  ✗'} ${name}${detail && !pass ? ` — ${detail}` : ''}`);
};

async function main() {
  const browser = await chromium.launch({ executablePath: findChromium() });
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  await page.setContent(PAGE, { waitUntil: 'load' });

  // Modal ------------------------------------------------------------------
  await page.click('#modal-open');
  await page.waitForTimeout(300);
  check('modal opens', await page.isVisible('#m .modal-content'));
  check('modal adds a backdrop', (await page.locator('.modal-backdrop').count()) === 1);
  check('modal locks page scroll', await page.evaluate(() => document.body.classList.contains('ja-scroll-locked')));
  check('modal moves focus inside', await page.evaluate(() => document.querySelector('#m').contains(document.activeElement)));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  check('Escape closes the modal', !(await page.isVisible('#m .modal-content')));
  check('backdrop is removed', (await page.locator('.modal-backdrop').count()) === 0);
  check('scroll lock is released', await page.evaluate(() => !document.body.classList.contains('ja-scroll-locked')));

  // Dropdown ---------------------------------------------------------------
  await page.click('#dd');
  await page.waitForTimeout(200);
  check('dropdown opens', await page.isVisible('.dropdown-menu'));
  check('dropdown sets aria-expanded', (await page.getAttribute('#dd', 'aria-expanded')) === 'true');
  await page.keyboard.press('ArrowDown');
  check('arrow key focuses the first item', await page.evaluate(() => document.activeElement?.id === 'dd-item'));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  check('Escape closes the dropdown', !(await page.isVisible('.dropdown-menu')));
  await page.click('#dd');
  await page.waitForTimeout(150);
  await page.mouse.click(880, 680);
  await page.waitForTimeout(200);
  check('outside click closes the dropdown', !(await page.isVisible('.dropdown-menu')));

  // Collapse ---------------------------------------------------------------
  await page.click('#col-toggle');
  await page.waitForTimeout(500);
  check('collapse expands', await page.isVisible('#col'));
  check('collapse clears its inline height', (await page.getAttribute('#col', 'style')) === '' || !(await page.getAttribute('#col', 'style'))?.includes('height: 0'));
  check('trigger reflects expanded state', (await page.getAttribute('#col-toggle', 'aria-expanded')) === 'true');
  await page.click('#col-toggle');
  await page.waitForTimeout(500);
  check('collapse collapses again', !(await page.isVisible('#col')));

  // Alert ------------------------------------------------------------------
  await page.click('#al .btn-close');
  await page.waitForTimeout(400);
  check('alert removes itself', (await page.locator('#al').count()) === 0);

  // Tabs -------------------------------------------------------------------
  await page.click('#tab2');
  await page.waitForTimeout(300);
  check('tab switches the pane', await page.isVisible('#p2'));
  check('previous pane is hidden', !(await page.isVisible('#p1')));
  check('tab sets aria-selected', (await page.getAttribute('#tab2', 'aria-selected')) === 'true');

  // Offcanvas --------------------------------------------------------------
  await page.click('#oc-open');
  await page.waitForTimeout(500);
  check('offcanvas opens', await page.isVisible('#oc'));
  await page.click('#oc [data-ja-dismiss="offcanvas"]');
  await page.waitForTimeout(600);
  check('offcanvas closes', !(await page.isVisible('#oc')));

  // Toast ------------------------------------------------------------------
  await page.evaluate(() => window.JaUI.Toast.getOrCreateInstance('#t', { delay: 600 }).show());
  await page.waitForTimeout(200);
  check('toast shows', await page.isVisible('#t'));
  await page.waitForTimeout(900);
  check('toast auto-hides', !(await page.isVisible('#t')));

  // Toggle button ----------------------------------------------------------
  await page.click('#tog');
  check('toggle button presses', (await page.getAttribute('#tog', 'aria-pressed')) === 'true');
  await page.click('#tog');
  check('toggle button releases', (await page.getAttribute('#tog', 'aria-pressed')) === 'false');

  // Theme API --------------------------------------------------------------
  await page.evaluate(() => window.JaUI.setTheme('dark'));
  check('setTheme flips the attribute', (await page.getAttribute('html', 'data-ja-theme')) === 'dark');
  check('resolved theme reports dark', await page.evaluate(() => window.JaUI.getResolvedTheme() === 'dark'));

  await browser.close();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
