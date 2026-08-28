/**
 * Smoke test: drive every interactive component in a real browser and assert
 * the visible outcome. Not a unit-test suite — a "does the JS actually work"
 * gate to run before publishing.
 *
 *   npm run build && npm run smoke
 */
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { homedir, tmpdir } from 'node:os';
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

  <div class="command-palette" id="cp"></div>
  <div id="dt" style="inline-size: 880px; margin-top: 1rem;"></div>
<script>${JS}</script></body></html>`;

const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? '  ✓' : '  ✗'} ${name}${detail && !pass ? ` — ${detail}` : ''}`);
};

/**
 * A bundler is allowed to drop a side-effect-only import from a package whose
 * `sideEffects` field says there are none — which would silently delete the
 * autoInit() boot and leave every data-attribute component dead in any app
 * built with Vite, webpack or Rollup. Prove the boot survives a real bundle.
 */
function checkSideEffectImportSurvives() {
  const dir = mkdtempSync(join(tmpdir(), 'ja-ui-sideeffects-'));
  try {
    const entry = join(dir, 'consumer.js');
    writeFileSync(entry, `import '${resolve('src/index.js')}';\n`);
    const bundle = execFileSync(
      join('node_modules', '.bin', 'esbuild'),
      [entry, '--bundle', '--format=esm', '--target=es2022'],
      { encoding: 'utf8' }
    );
    check(
      'a side-effect-only import still boots the data attributes',
      bundle.includes('data-ja-no-autoinit'),
      "the autoInit boot was tree-shaken — check package.json's sideEffects field"
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

async function main() {
  checkSideEffectImportSurvives();

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

  // Command palette --------------------------------------------------------
  await page.evaluate(() => {
    window.picked = null;
    window.palette = new window.JaUI.CommandPalette('#cp', {
      items: [
        { label: 'Deploy to staging', group: 'Actions' },
        { label: 'Deploy to production', group: 'Actions', disabled: true },
        { label: 'User settings', description: 'Theme and shortcuts', group: 'Settings' },
        ...Array.from({ length: 5000 }, (_, i) => ({ label: `Record ${i}`, group: 'Data' })),
      ],
      onSelect: (item) => {
        window.picked = item.label;
      },
    });
  });
  await page.mouse.move(450, 300); // park the cursor over the list before it opens
  await page.evaluate(() => window.palette.show());
  await page.waitForTimeout(350);
  check('palette opens', await page.isVisible('#cp .command-palette-dialog'));
  check('palette focuses its input', await page.evaluate(() => document.activeElement?.classList.contains('command-palette-input')));
  check(
    'palette virtualises a 5,000-row list',
    await page.evaluate(() => {
      const rows = document.querySelectorAll('#cp .command-palette-item:not([hidden])').length;
      return rows > 0 && rows < 40;
    })
  );
  check('a resting pointer does not steal the selection', await page.evaluate(() => window.palette.activeItem?.label === 'Deploy to staging'));
  await page.keyboard.press('ArrowDown');
  check('arrow keys skip disabled rows', await page.evaluate(() => window.palette.activeItem?.label === 'User settings'));
  await page.keyboard.press('Control+k');
  check('ctrl-K moves back up', await page.evaluate(() => window.palette.activeItem?.label === 'Deploy to staging'));
  await page.fill('#cp .command-palette-input', 'usr set');
  await page.waitForTimeout(80);
  check('fuzzy search matches across gaps', await page.evaluate(() => window.palette.activeItem?.label === 'User settings'));
  check('matched characters are marked', (await page.locator('#cp .command-palette-item.is-active mark').count()) > 0);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(350);
  check('Enter runs the highlighted item', await page.evaluate(() => window.picked === 'User settings'));
  check('palette closes after a selection', !(await page.isVisible('#cp .command-palette-dialog')));

  // Data table -------------------------------------------------------------
  await page.evaluate(() => {
    window.dataTable = new window.JaUI.DataTable('#dt', {
      columnCount: 1000,
      rowCount: 1000000,
      defaultColumnWidth: 160,
      maxAutoWidth: 280,
      autoSizeSample: 32,
      getColumnLabel: (index) => `Field ${index + 1}`,
      getCell: (rowIndex, columnIndex) =>
        columnIndex === 3 && rowIndex === 20
          ? '{"kind":"blob","payload":"this long string should clamp before it gets silly wide"}'
          : `R${rowIndex + 1}C${columnIndex + 1}`,
    });
  });
  await page.waitForTimeout(150);
  check(
    'data table virtualises a million-by-thousand sheet',
    await page.evaluate(() => {
      const cells = document.querySelectorAll('#dt .datatable-cell:not([hidden])').length;
      const headers = document.querySelectorAll('#dt .datatable-header-cell:not([hidden])').length;
      return cells > 0 && cells < 800 && headers > 0 && headers < 20;
    })
  );
  await page.click('#dt .datatable-corner');
  check('data table selects the whole sheet from the corner gutter', await page.evaluate(() => window.dataTable.selectedAll));
  const widthBefore = await page.evaluate(() => window.dataTable._columnWidths[3]);
  await page.dblclick('#dt .datatable-header-cell[data-col="3"] .datatable-resize-handle');
  await page.waitForTimeout(80);
  check(
    'double-click auto-sizes a column but respects the cap',
    await page.evaluate((before) => {
      const after = window.dataTable._columnWidths[3];
      return after > before && after <= 280;
    }, widthBefore)
  );
  const widthDragBefore = await page.evaluate(() => window.dataTable._columnWidths[1]);
  const handle = page.locator('#dt .datatable-header-cell[data-col="1"] .datatable-resize-handle');
  const box = await handle.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 64, box.y + box.height / 2, { steps: 4 });
  await page.mouse.up();
  check(
    'dragging a header edge resizes the column',
    await page.evaluate((before) => window.dataTable._columnWidths[1] > before, widthDragBefore)
  );
  await page.dblclick('#dt .datatable-corner .datatable-resize-handle');
  await page.waitForTimeout(100);
  check(
    'double-clicking the selected corner edge auto-sizes every column',
    await page.evaluate(() => window.dataTable._columnWidths[0] !== 160 && window.dataTable._columnWidths[3] <= 280)
  );
  await page.evaluate(() => {
    const viewport = document.querySelector('#dt .datatable-viewport');
    viewport.scrollTop = 500000 * 40;
    viewport.scrollLeft = 400 * 160;
    viewport.dispatchEvent(new Event('scroll'));
  });
  await page.waitForTimeout(150);
  check(
    'data table keeps rendering after deep scrolling',
    await page.evaluate(() => {
      const any = document.querySelector('#dt .datatable-cell[data-row="500001"][data-col="400"]');
      return Boolean(any?.textContent?.includes('R500002C401'));
    })
  );

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
