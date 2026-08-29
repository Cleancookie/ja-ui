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
  <!-- Modal: a plain <dialog>, opened by a plain invoker button. No classes. -->
  <button id="dlg-open" commandfor="dlg" command="show-modal">Open</button>
  <dialog id="dlg">
    <header><h2>Title</h2></header>
    <input id="dlg-input" autofocus />
    <footer><button id="dlg-close" commandfor="dlg" command="close">Close</button></footer>
  </dialog>

  <!-- Drawer: the same element, pinned to an edge by one class. -->
  <button id="drawer-open" commandfor="drawer" command="show-modal">Drawer</button>
  <dialog id="drawer" class="drawer end">
    <button id="drawer-close" commandfor="drawer" command="close">Close</button>
  </dialog>

  <!-- Dropdown: the popover API. -->
  <button id="pop-open" popovertarget="pop">Menu</button>
  <menu id="pop" popover><li><button id="pop-item">One</button></li></menu>

  <!-- Accordion: <details>, which needs no JavaScript whatsoever. -->
  <details id="det"><summary id="det-summary">More</summary><p id="det-body">Region</p></details>

  <!-- Tabs: the one pattern with no native element. -->
  <div role="tablist" aria-label="Sections">
    <button role="tab" id="tab1" aria-selected="true" aria-controls="p1" tabindex="0">1</button>
    <button role="tab" id="tab2" aria-selected="false" aria-controls="p2" tabindex="-1">2</button>
  </div>
  <div id="p1" role="tabpanel" tabindex="0" aria-labelledby="tab1">Pane one</div>
  <div id="p2" role="tabpanel" tabindex="0" aria-labelledby="tab2" hidden>Pane two</div>

  <div class="command-palette" id="cp"></div>
  <div id="dt" style="inline-size: 880px"></div>
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

  // Dialog — the modal is just <dialog> -----------------------------------
  await page.click('#dlg-open');
  await page.waitForTimeout(300);
  check('a command button opens the dialog', await page.evaluate(() => document.querySelector('#dlg').open));
  check('the dialog is modal, so it gets a ::backdrop', await page.evaluate(() => document.querySelector('#dlg').matches(':modal')));
  check('opening a modal locks the page scroll', await page.evaluate(() => getComputedStyle(document.documentElement).overflow === 'hidden'));
  check('autofocus moves focus inside', await page.evaluate(() => document.activeElement?.id === 'dlg-input'));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  check('Escape closes the dialog', await page.evaluate(() => !document.querySelector('#dlg').open));
  check('the scroll lock is released', await page.evaluate(() => getComputedStyle(document.documentElement).overflow !== 'hidden'));

  await page.click('#dlg-open');
  await page.waitForTimeout(250);
  await page.click('#dlg-close');
  await page.waitForTimeout(400);
  check('a close command button closes the dialog', await page.evaluate(() => !document.querySelector('#dlg').open));

  // Drawer — the same element, one class ------------------------------------
  await page.click('#drawer-open');
  await page.waitForTimeout(400);
  check('the drawer opens', await page.evaluate(() => document.querySelector('#drawer').open));
  check('the drawer is pinned to an edge, not centred', await page.evaluate(() => {
    const box = document.querySelector('#drawer').getBoundingClientRect();
    return Math.abs(box.right - window.innerWidth) < 2;
  }));
  await page.click('#drawer-close');
  await page.waitForTimeout(400);
  check('the drawer closes', await page.evaluate(() => !document.querySelector('#drawer').open));

  // Popover — the dropdown --------------------------------------------------
  await page.click('#pop-open');
  await page.waitForTimeout(200);
  check('the popover opens', await page.evaluate(() => document.querySelector('#pop').matches(':popover-open')));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  check('Escape light-dismisses the popover', await page.evaluate(() => !document.querySelector('#pop').matches(':popover-open')));
  await page.click('#pop-open');
  await page.waitForTimeout(150);
  await page.mouse.click(880, 680);
  await page.waitForTimeout(200);
  check('an outside click light-dismisses the popover', await page.evaluate(() => !document.querySelector('#pop').matches(':popover-open')));

  // Details — zero JavaScript ----------------------------------------------
  check('details starts closed', !(await page.isVisible('#det-body')));
  await page.click('#det-summary');
  await page.waitForTimeout(400);
  check('details opens with no JavaScript at all', await page.isVisible('#det-body'));
  check('the summary is a real touch target', await page.evaluate(() => document.querySelector('#det-summary').getBoundingClientRect().height >= 44));
  await page.click('#det-summary');
  await page.waitForTimeout(400);
  check('details closes again', !(await page.isVisible('#det-body')));

  // Tabs — the APG keyboard model ------------------------------------------
  await page.click('#tab2');
  await page.waitForTimeout(200);
  check('clicking a tab reveals its panel', await page.isVisible('#p2'));
  check('the previous panel is hidden', !(await page.isVisible('#p1')));
  check('aria-selected follows the tab', (await page.getAttribute('#tab2', 'aria-selected')) === 'true');
  check('the roving tabindex moves with it', await page.evaluate(() =>
    document.querySelector('#tab2').tabIndex === 0 && document.querySelector('#tab1').tabIndex === -1));
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(150);
  check('ArrowRight wraps to the first tab', (await page.getAttribute('#tab1', 'aria-selected')) === 'true');
  await page.keyboard.press('End');
  await page.waitForTimeout(150);
  check('End jumps to the last tab', (await page.getAttribute('#tab2', 'aria-selected')) === 'true');

  // Toasts ------------------------------------------------------------------
  await page.evaluate(() => window.JaUI.toast('Saved.', { duration: 500 }));
  await page.waitForTimeout(200);
  check('a toast appears', (await page.locator('.toasts .toast').count()) === 1);
  check('the toast region is a manual popover', await page.evaluate(() =>
    document.querySelector('.toasts')?.getAttribute('popover') === 'manual'));
  check('the toast is polite, not assertive', await page.evaluate(() =>
    document.querySelector('.toasts .toast')?.getAttribute('role') === 'status'));
  await page.waitForTimeout(1200);
  check('the toast dismisses itself', (await page.locator('.toasts .toast').count()) === 0);

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
  await page.evaluate(() => {
    const handle = document.querySelector('#dt .datatable-header-cell[data-col="1"] .datatable-resize-handle');
    handle.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 200 }));
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: 264 }));
    window.dispatchEvent(new PointerEvent('pointerup', { clientX: 264 }));
  });
  await page.waitForTimeout(80);
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
    viewport.scrollTop = window.dataTable._headerHeight + 500000 * window.dataTable._rowHeight;
    viewport.scrollLeft = window.dataTable._gutterWidth + window.dataTable._columnOffsets[400];
    viewport.dispatchEvent(new Event('scroll'));
  });
  await page.waitForTimeout(150);
  check(
    'data table keeps rendering after deep scrolling',
    await page.evaluate(() => {
      const any = document.querySelector('#dt .datatable-cell[data-row="500000"][data-col="400"]');
      return Boolean(any?.textContent?.includes('R500001C401'));
    })
  );

  // Theme API --------------------------------------------------------------
  await page.evaluate(() => window.JaUI.setTheme('dark'));
  check('setTheme flips the attribute', (await page.getAttribute('html', 'data-theme')) === 'dark');
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
